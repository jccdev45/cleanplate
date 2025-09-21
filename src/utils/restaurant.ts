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

// NOTE: timing constants live in the `queries` layer where they're used.

// The query-layer has been migrated to `src/queries/restaurant.ts`.
// This file now only exposes server-side helpers used by the queries and
// server functions. Keeping the server functions here avoids circular
// dependencies with React Query utilities which belong in the `queries/` layer.
