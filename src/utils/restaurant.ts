import { retryFetch, sanitizeSnippet, stripQuotes } from "@/lib/fetch-utils";
import { sendPosthogEvent } from "@/lib/posthog";
import { buildSocrataUrl } from "@/lib/socrata";
import {
	type RestaurantRaw,
	restaurantRawSchema,
	restaurantSearchParamsSchema,
} from "@/schema/schema";
import type { Restaurant } from "@/types/restaurant";
import { groupRestaurants } from "@/utils/restaurant-grouping";
import { createServerFn } from "@tanstack/react-start";

const appToken = process.env.RESTAURANT_API_APP_TOKEN;

// Server-side aggregator for cuisine trends. Returns { data, topCuisines }
export const getCuisineTrendsFn = createServerFn({ method: "GET" })
	.validator(
		(val: unknown) =>
			val as { topN?: number; minYear?: number; maxYear?: number } | undefined,
	)
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
		const params: Record<string, unknown> = {};
		const topN = Number(data?.topN ?? 6);
		const minYear = data?.minYear;
		const maxYear = data?.maxYear;

		// Use Socrata aggregation: extract year and group by cuisine + year
		params.$select =
			"date_extract_y(inspection_date) AS year, cuisine_description, COUNT(camis) AS cnt";
		params.$group = "year, cuisine_description";
		params.$order = "year ASC";
		params.$limit = 50000;

		if (minYear || maxYear) {
			const conds: string[] = [];
			if (minYear)
				conds.push(`date_extract_y(inspection_date) >= ${Number(minYear)}`);
			if (maxYear)
				conds.push(`date_extract_y(inspection_date) <= ${Number(maxYear)}`);
			params.$where = conds.join(" AND ");
		}

		const urlStr = buildSocrataUrl(BASE_URL, params);
		const response = await retryFetch(urlStr, {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});

		if (!response.ok) {
			const text = await response.text();
			const snippet = sanitizeSnippet(text, 1000);
			void sendPosthogEvent("socrata_error", {
				url: urlStr,
				status: response.status,
				statusText: response.statusText,
				snippet,
			});
			throw new Error(
				`Socrata aggregation request failed: ${response.status} ${response.statusText}`,
			);
		}

		const result = await response.json();
		if (!Array.isArray(result)) return { data: [], topCuisines: [] };

		const totals: Record<string, number> = {};
		const byYearCuisine: Record<string, Record<string, number>> = {};
		const rows = result as Array<Record<string, unknown>>;
		for (const row of rows) {
			const year = String(row.year ?? "");
			const cuisine = String(row.cuisine_description ?? "Unknown");
			const cnt = Number((row.cnt ?? row.count ?? 0) as unknown);
			if (!/^[0-9]{4}$/.test(year)) continue;
			byYearCuisine[year] ??= {};
			byYearCuisine[year][cuisine] = (byYearCuisine[year][cuisine] ?? 0) + cnt;
			totals[cuisine] = (totals[cuisine] ?? 0) + cnt;
		}

		const topCuisines = Object.entries(totals)
			.sort((a, b) => b[1] - a[1])
			.slice(0, topN)
			.map((e) => e[0]);

		const years = Object.keys(byYearCuisine).sort();
		const dataOut = years.map((y) => {
			const row: Record<string, string | number> = { year: y };
			for (const cuisine of topCuisines) {
				row[cuisine] = byYearCuisine[y][cuisine] ?? 0;
			}
			return row;
		});

		return { data: dataOut, topCuisines };
	});

// Server-side aggregator for cuisine counts. Returns { data: Array<{ cuisine, count }> }
export const getCuisineCountsFn = createServerFn({ method: "GET" })
	.validator(
		(val: unknown) =>
			val as { topN?: number; minYear?: number; maxYear?: number } | undefined,
	)
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
		const params: Record<string, unknown> = {};
		const topN = Number(data?.topN ?? 0);

		params.$select = "cuisine_description, COUNT(camis) AS cnt";
		params.$group = "cuisine_description";
		params.$order = "cnt DESC";
		// allow returning many rows but the client will pick topN
		params.$limit = 50000;

		if (data?.minYear || data?.maxYear) {
			const conds: string[] = [];
			if (data?.minYear)
				conds.push(
					`date_extract_y(inspection_date) >= ${Number(data.minYear)}`,
				);
			if (data?.maxYear)
				conds.push(
					`date_extract_y(inspection_date) <= ${Number(data.maxYear)}`,
				);
			params.$where = conds.join(" AND ");
		}

		const urlStr = buildSocrataUrl(BASE_URL, params);
		const response = await retryFetch(urlStr, {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});

		if (!response.ok) {
			const text = await response.text();
			const snippet = sanitizeSnippet(text, 1000);
			void sendPosthogEvent("socrata_error", {
				url: urlStr,
				status: response.status,
				statusText: response.statusText,
				snippet,
			});
			throw new Error(
				`Socrata aggregation request failed: ${response.status} ${response.statusText}`,
			);
		}

		const result = await response.json();
		if (!Array.isArray(result)) return { data: [] };

		const rows = result as Array<Record<string, unknown>>;
		const out: Array<{ cuisine: string; count: number }> = rows
			.map((r) => {
				const cuisine = String(r.cuisine_description ?? "Unknown");
				const cnt = Number((r.cnt ?? r.count ?? 0) as unknown) || 0;
				return { cuisine, count: cnt };
			})
			.sort((a, b) => b.count - a.count);

		const dataOut = topN && topN > 0 ? out.slice(0, topN) : out;
		return { data: dataOut };
	});

// Server-side aggregator for borough counts
export const getBoroughCountsFn = createServerFn({ method: "GET" })
	.validator(
		(val: unknown) => val as { minYear?: number; maxYear?: number } | undefined,
	)
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
		const params: Record<string, unknown> = {};

		params.$select = "boro, COUNT(camis) AS cnt";
		params.$group = "boro";
		params.$order = "cnt DESC";
		params.$limit = 50000;

		if (data?.minYear || data?.maxYear) {
			const conds: string[] = [];
			if (data?.minYear)
				conds.push(
					`date_extract_y(inspection_date) >= ${Number(data.minYear)}`,
				);
			if (data?.maxYear)
				conds.push(
					`date_extract_y(inspection_date) <= ${Number(data.maxYear)}`,
				);
			params.$where = conds.join(" AND ");
		}

		const urlStr = buildSocrataUrl(BASE_URL, params);
		const response = await retryFetch(urlStr, {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});

		if (!response.ok) {
			const text = await response.text();
			const snippet = sanitizeSnippet(text, 1000);
			void sendPosthogEvent("socrata_error", {
				url: urlStr,
				status: response.status,
				statusText: response.statusText,
				snippet,
			});
			throw new Error(
				`Socrata aggregation request failed: ${response.status} ${response.statusText}`,
			);
		}

		const result = await response.json();
		if (!Array.isArray(result)) return { data: [] };

		const rows = result as Array<Record<string, unknown>>;
		const out = rows.map((r) => ({
			boro: String(r.boro ?? "Unknown"),
			count: Number((r.cnt ?? r.count ?? 0) as unknown) || 0,
		}));
		return { data: out };
	});

// Server-side aggregator for grade distribution
export const getGradeDistributionFn = createServerFn({ method: "GET" })
	.validator(
		(val: unknown) => val as { minYear?: number; maxYear?: number } | undefined,
	)
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
		const params: Record<string, unknown> = {};

		params.$select = "grade, COUNT(camis) AS cnt";
		params.$group = "grade";
		params.$order = "grade ASC";
		params.$limit = 50000;

		if (data?.minYear || data?.maxYear) {
			const conds: string[] = [];
			if (data?.minYear)
				conds.push(
					`date_extract_y(inspection_date) >= ${Number(data.minYear)}`,
				);
			if (data?.maxYear)
				conds.push(
					`date_extract_y(inspection_date) <= ${Number(data.maxYear)}`,
				);
			params.$where = conds.join(" AND ");
		}

		const urlStr = buildSocrataUrl(BASE_URL, params);
		const response = await retryFetch(urlStr, {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});

		if (!response.ok) {
			const text = await response.text();
			const snippet = sanitizeSnippet(text, 1000);
			void sendPosthogEvent("socrata_error", {
				url: urlStr,
				status: response.status,
				statusText: response.statusText,
				snippet,
			});
			throw new Error(
				`Socrata aggregation request failed: ${response.status} ${response.statusText}`,
			);
		}

		const result = await response.json();
		if (!Array.isArray(result)) return { data: [] };

		const rows = result as Array<Record<string, unknown>>;
		const out = rows.map((r) => ({
			grade: String(r.grade ?? "N/A"),
			count: Number((r.cnt ?? r.count ?? 0) as unknown) || 0,
		}));
		return { data: out };
	});

// Server-side aggregator for critical flag distribution
export const getCriticalFlagDistributionFn = createServerFn({ method: "GET" })
	.validator(
		(val: unknown) => val as { minYear?: number; maxYear?: number } | undefined,
	)
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
		const params: Record<string, unknown> = {};

		params.$select = "critical_flag, COUNT(camis) AS cnt";
		params.$group = "critical_flag";
		params.$order = "cnt DESC";
		params.$limit = 50000;

		if (data?.minYear || data?.maxYear) {
			const conds: string[] = [];
			if (data?.minYear)
				conds.push(
					`date_extract_y(inspection_date) >= ${Number(data.minYear)}`,
				);
			if (data?.maxYear)
				conds.push(
					`date_extract_y(inspection_date) <= ${Number(data.maxYear)}`,
				);
			params.$where = conds.join(" AND ");
		}

		const urlStr = buildSocrataUrl(BASE_URL, params);
		const response = await retryFetch(urlStr, {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});

		if (!response.ok) {
			const text = await response.text();
			const snippet = sanitizeSnippet(text, 1000);
			void sendPosthogEvent("socrata_error", {
				url: urlStr,
				status: response.status,
				statusText: response.statusText,
				snippet,
			});
			throw new Error(
				`Socrata aggregation request failed: ${response.status} ${response.statusText}`,
			);
		}

		const result = await response.json();
		if (!Array.isArray(result)) return { data: [] };

		const rows = result as Array<Record<string, unknown>>;
		const out = rows.map((r) => ({
			name: String(r.critical_flag ?? "Not Applicable"),
			value: Number((r.cnt ?? r.count ?? 0) as unknown) || 0,
		}));
		return { data: out };
	});

// Server-side aggregator for score histogram (returns per-score counts)
export const getScoreHistogramFn = createServerFn({ method: "GET" })
	.validator(
		(val: unknown) => val as { minYear?: number; maxYear?: number } | undefined,
	)
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
		const params: Record<string, unknown> = {};

		params.$select = "score, COUNT(camis) AS cnt";
		params.$group = "score";
		params.$order = "score ASC";
		params.$limit = 50000;

		if (data?.minYear || data?.maxYear) {
			const conds: string[] = [];
			if (data?.minYear)
				conds.push(
					`date_extract_y(inspection_date) >= ${Number(data.minYear)}`,
				);
			if (data?.maxYear)
				conds.push(
					`date_extract_y(inspection_date) <= ${Number(data.maxYear)}`,
				);
			params.$where = conds.join(" AND ");
		}

		const urlStr = buildSocrataUrl(BASE_URL, params);
		const response = await retryFetch(urlStr, {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});

		if (!response.ok) {
			const text = await response.text();
			const snippet = sanitizeSnippet(text, 1000);
			void sendPosthogEvent("socrata_error", {
				url: urlStr,
				status: response.status,
				statusText: response.statusText,
				snippet,
			});
			throw new Error(
				`Socrata aggregation request failed: ${response.status} ${response.statusText}`,
			);
		}

		const result = await response.json();
		if (!Array.isArray(result)) return { data: [] };

		const rows = result as Array<Record<string, unknown>>;
		const out = rows
			.map((r) => ({
				score: Number(r.score as unknown) || 0,
				count: Number((r.cnt ?? r.count ?? 0) as unknown) || 0,
			}))
			.sort((a, b) => a.score - b.score);
		return { data: out };
	});

// Server-side dashboard stats: small focused queries to power the charts index
export const getDashboardStatsFn = createServerFn({ method: "GET" })
	.validator(
		(val: unknown) =>
			val as
				| { topCuisines?: number; minYear?: number; maxYear?: number }
				| undefined,
	)
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
		const topN = Number(data?.topCuisines ?? 5);

		// Helper to run a socrata query
		async function fetchJson(params: Record<string, unknown>) {
			const url = buildSocrataUrl(BASE_URL, params);
			const res = await retryFetch(url, {
				headers: {
					Accept: "application/json",
					...(appToken ? { "X-App-Token": appToken } : {}),
				},
			});
			if (!res.ok) {
				const text = await res.text();
				void sendPosthogEvent("socrata_error", {
					url,
					status: res.status,
					statusText: res.statusText,
					snippet: sanitizeSnippet(text, 1000),
				});
				throw new Error(
					`Socrata request failed: ${res.status} ${res.statusText}`,
				);
			}
			return res.json();
		}

		function extractFirstNumber(row: unknown): number {
			if (!row || typeof row !== "object") return 0;
			const obj = row as Record<string, unknown>;
			// try common aliases
			for (const key of [
				"total",
				"count",
				"cnt",
				"count_a",
				"crit_count",
				"total_cuisines",
				"avg_score",
			]) {
				if (key in obj) {
					const raw = (obj as Record<string, unknown>)[key];
					const val = Number(raw as unknown);
					if (!Number.isNaN(val)) return val;
				}
			}
			// fallback to first numeric property
			const vals = Object.values(obj);
			for (const v of vals) {
				const n = Number(v as unknown);
				if (!Number.isNaN(n)) return n;
			}
			return 0;
		}

		// total distinct restaurants
		const totalRows = await fetchJson({
			$select: "COUNT(DISTINCT camis) AS total",
		});
		const totalRestaurants = extractFirstNumber(totalRows?.[0]);

		// average score over inspections (approximation)
		const avgRows = await fetchJson({ $select: "AVG(score) AS avg_score" });
		const avgScoreRaw = extractFirstNumber(avgRows?.[0]);
		const avgScore = Number.isFinite(avgScoreRaw) ? avgScoreRaw : 0;

		// distinct cuisine count
		const cuisineRows = await fetchJson({
			$select: "COUNT(DISTINCT cuisine_description) AS total_cuisines",
		});
		const totalCuisines = extractFirstNumber(cuisineRows?.[0]);

		// percent grade A: distinct camis with grade A divided by total distinct camis
		const gradeARows = await fetchJson({
			$select: "COUNT(DISTINCT camis) AS count_a",
			$where: "grade = 'A'",
		});
		const gradeACount = extractFirstNumber(gradeARows?.[0]);
		const pctGradeA =
			totalRestaurants > 0 ? (gradeACount / totalRestaurants) * 100 : 0;

		// percent restaurants with at least one critical flag Y
		const critRows = await fetchJson({
			$select: "COUNT(DISTINCT camis) AS crit_count",
			$where: "critical_flag = 'Y'",
		});
		const critCount = extractFirstNumber(critRows?.[0]);
		const pctCritical =
			totalRestaurants > 0 ? (critCount / totalRestaurants) * 100 : 0;

		// top cuisines by distinct restaurants
		const topCuisineRows = await fetchJson({
			$select: "cuisine_description, COUNT(DISTINCT camis) AS cnt",
			$group: "cuisine_description",
			$order: "cnt DESC",
			$limit: topN,
		});
		const topCuisines = Array.isArray(topCuisineRows)
			? topCuisineRows.map((r: Record<string, unknown>) => ({
					cuisine: String(r.cuisine_description ?? "Unknown"),
					count: Number((r.cnt ?? r.count ?? 0) as unknown) || 0,
				}))
			: [];

		return {
			totalRestaurants,
			avgScore: Number.isFinite(avgScore) ? avgScore : null,
			totalCuisines,
			pctGradeA,
			pctCritical,
			topCuisines,
		};
	});

export const getRestaurantsFn = createServerFn({ method: "GET" })
	// Accept strong params via Zod. This allows map-specific params to exist in the URL
	.validator((val) => restaurantSearchParamsSchema.parse(val))
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";

		// Copy into a mutable params object so we can add $select and defaults without breaking types
		const paramsRaw: Record<string, unknown> = {
			...(data as Record<string, unknown>),
		};

		// Compute flags from the raw params so we can validate/filter results later
		const markerVal = stripQuotes(paramsRaw.markerOnly ?? paramsRaw.markerOnly);
		const markerOnly =
			markerVal === "1" ||
			(typeof markerVal === "string" && markerVal.toLowerCase() === "true") ||
			paramsRaw.markerOnly === true;

		const includeUninspectedVal = stripQuotes(
			paramsRaw.includeUninspected ?? paramsRaw.includeUninspected,
		);
		const includeUninspected =
			includeUninspectedVal === "1" ||
			(typeof includeUninspectedVal === "string" &&
				includeUninspectedVal.toLowerCase() === "true") ||
			paramsRaw.includeUninspected === true;

		// Use shared builder to produce final URL and sanitized params
		const urlStr = buildSocrataUrl(BASE_URL, paramsRaw, {
			markerOnlyDefaultLimit: 300,
		});
		// Use the shared retryFetch helper which implements exponential backoff for 5xx.
		const response = await retryFetch(urlStr, {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});

		if (!response.ok) {
			const text = await response.text();
			const snippet = sanitizeSnippet(text, 1000);
			void sendPosthogEvent("socrata_error", {
				url: urlStr,
				status: response.status,
				statusText: response.statusText,
				snippet,
			});
			throw new Error(
				`Socrata request failed: ${response.status} ${response.statusText} url=${urlStr} body_snippet=${snippet}`,
			);
		}

		const result = await response.json();

		// Validate API response is an array of restaurant objects.
		// Use per-item safeParse so a few bad rows don't abort the whole response
		let rawRows: RestaurantRaw[] = [];
		if (!Array.isArray(result)) {
			const snippet =
				typeof result === "string"
					? result.slice(0, 1000)
					: JSON.stringify(result).slice(0, 1000);
			throw new Error(
				`API response was not an array. url=${urlStr} result_snippet=${snippet}`,
			);
		}

		if (markerOnly) {
			// marker-only responses return a trimmed set of fields; accept partial rows
			const schema = (await import("zod")).z.array(
				restaurantRawSchema.partial(),
			);
			// try a quick full-parse first for performance
			const full = schema.safeParse(result);
			if (full.success) {
				rawRows = full.data as RestaurantRaw[];
			} else {
				// fallback: validate per-item and keep valid ones
				rawRows = (result as unknown[])
					.map((r) => restaurantRawSchema.partial().safeParse(r))
					.filter((p) => p.success)
					.map((p) => p.data as RestaurantRaw);
			}
		} else {
			// full responses: validate each row individually and keep valid rows
			rawRows = (result as unknown[])
				.map((r) => restaurantRawSchema.safeParse(r))
				.filter((p) => p.success)
				.map((p) => p.data as RestaurantRaw)
				// Filter out sentinel inspection_date rows unless the caller opted in
				.filter((row) => {
					const insp = (row.inspection_date ?? "").slice(0, 10);
					const isSentinel = insp === "1900-01-01";
					if (isSentinel && !includeUninspected) return false;
					// normalize sentinel to empty string so downstream code treats it as missing
					if (isSentinel) {
						(row as unknown as Record<string, unknown>).inspection_date = "";
					}
					return true;
				});
		}

		if (!rawRows.length) {
			const snippet = JSON.stringify((result as unknown[]).slice(0, 5)).slice(
				0,
				1000,
			);
			try {
				console.warn(
					`Socrata returned no valid rows for request. url=${urlStr} result_snippet=${snippet}`,
				);
			} catch (_err) {
				// ignore logging failures in constrained runtimes
			}
			const restaurants: Restaurant[] = [];
			return {
				restaurants,
				count: 0,
				nextOffset: undefined,
			};
		}

		const restaurants = groupRestaurants(rawRows);

		return {
			restaurants,
			count: restaurants.length,
			nextOffset: restaurants.length
				? (data.$offset ?? 0) + (data.$limit ?? 0)
				: undefined,
		};
	});
