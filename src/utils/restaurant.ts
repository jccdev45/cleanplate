import {
	parseNum,
	retryFetch,
	sanitizeSnippet,
	stripQuotes,
} from "@/lib/fetch-utils";
import { sendPosthogEvent } from "@/lib/posthog";
import { groupRestaurants } from "@/lib/utils";
import {
	type RestaurantRaw,
	type RestaurantSearchParams,
	restaurantRawSchema,
	restaurantSearchParamsSchema,
} from "@/schema/schema";
import type { Restaurant } from "@/types/restaurant";
import {
	infiniteQueryOptions,
	keepPreviousData,
	queryOptions,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

const appToken = process.env.RESTAURANT_API_APP_TOKEN;

export const getRestaurantsFn = createServerFn({ method: "GET" })
	// Accept strong params via Zod. This allows map-specific params to exist in the URL
	.validator((val) => restaurantSearchParamsSchema.parse(val))
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";

		// Construct URL with query parameters
		const url = new URL(BASE_URL);
		// Copy into a mutable params object so we can add $select and defaults without breaking types
		const paramsRaw: Record<string, unknown> = {
			...(data as Record<string, unknown>),
		};

		// Build a sanitized params object for URL generation
		const params: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(paramsRaw)) {
			if (v === undefined || v === null) continue;
			// Keep raw strings/numbers, but strip quotes for strings
			if (typeof v === "string") {
				params[k] = stripQuotes(v);
			} else {
				params[k] = v;
			}
		}

		// If markerOnly flag present (coerce and accept quoted values), request compact fields and lower default limit
		const markerVal = stripQuotes(params.markerOnly ?? paramsRaw.markerOnly);
		const markerOnly =
			markerVal === "1" ||
			(typeof markerVal === "string" && markerVal.toLowerCase() === "true") ||
			params.markerOnly === true ||
			paramsRaw.markerOnly === true;
		if (markerOnly) {
			// include cuisine_description and building/street so the client can synthesize an address
			params.$select =
				"camis,dba,latitude,longitude,grade,critical_flag,inspection_date,boro,zipcode,cuisine_description,building,street";
			if (params.$limit === undefined) params.$limit = 300;
		}

		// includeUninspected: opt-in flag to include rows with sentinel inspection_date (1900-01-01).
		// Default behavior: exclude sentinel rows to avoid fetching lots of new/uninspected entries.
		const includeUninspectedVal = stripQuotes(
			params.includeUninspected ?? paramsRaw.includeUninspected,
		);
		const includeUninspected =
			includeUninspectedVal === "1" ||
			(typeof includeUninspectedVal === "string" &&
				includeUninspectedVal.toLowerCase() === "true") ||
			params.includeUninspected === true ||
			paramsRaw.includeUninspected === true;

		// If bounding box params are provided, construct a Socrata $where to restrict by bbox
		const minLatN = parseNum(params.minLat ?? paramsRaw.minLat);
		const maxLatN = parseNum(params.maxLat ?? paramsRaw.maxLat);
		const minLngN = parseNum(params.minLng ?? paramsRaw.minLng);
		const maxLngN = parseNum(params.maxLng ?? paramsRaw.maxLng);
		const hasBbox =
			minLatN !== undefined &&
			maxLatN !== undefined &&
			minLngN !== undefined &&
			maxLngN !== undefined;
		if (hasBbox) {
			// Socrata field names are latitude and longitude
			params.$where = `latitude >= ${minLatN} AND latitude <= ${maxLatN} AND longitude >= ${minLngN} AND longitude <= ${maxLngN}`;
			// also write back numeric bbox so downstream code can rely on numbers if needed
			params.minLat = minLatN;
			params.maxLat = maxLatN;
			params.minLng = minLngN;
			params.maxLng = maxLngN;
		}

		// Treat Socrata's sentinel inspection date (1900-01-01) as "no inspection yet".
		// If the caller explicitly asked for oldest-first sorting by inspection_date (ASC),
		// exclude the sentinel rows so new/uninspected establishments don't appear as the oldest.
		const orderVal = String(
			params.$order ?? paramsRaw.$order ?? "",
		).toLowerCase();
		if (orderVal.includes("inspection_date") && orderVal.includes("asc")) {
			const sentinelCond = "inspection_date > '1900-01-01T00:00:00.000'";
			if (params.$where) {
				params.$where = `(${String(params.$where)}) AND ${sentinelCond}`;
			} else {
				params.$where = sentinelCond;
			}
		}

		// Remove internal-only keys that Socrata doesn't accept
		const INTERNAL_KEYS = [
			"minLat",
			"maxLat",
			"minLng",
			"maxLng",
			"markerOnly",
			// Client-only view params that must not be forwarded as equality filters
			"latitude",
			"longitude",
			// Client-only params that shouldn't be forwarded to Socrata
			"zoom",
		];
		for (const k of INTERNAL_KEYS) {
			if (k in params) delete params[k];
		}

		// Convert all params to string before passing to URLSearchParams, omitting undefined
		const entries: [string, string][] = [];
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined || value === null) continue;
			entries.push([key, String(value)]);
		}
		if (entries.length) {
			url.search = new URLSearchParams(entries).toString();
		}

		// Use the shared retryFetch helper which implements exponential backoff for 5xx.
		const response = await retryFetch(url.toString(), {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});

		if (!response.ok) {
			const text = await response.text();
			const snippet = sanitizeSnippet(text, 1000);
			void sendPosthogEvent("socrata_error", {
				url: url.toString(),
				status: response.status,
				statusText: response.statusText,
				snippet,
			});
			throw new Error(
				`Socrata request failed: ${response.status} ${response.statusText} url=${url.toString()} body_snippet=${snippet}`,
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
				`API response was not an array. url=${url.toString()} result_snippet=${snippet}`,
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
					`Socrata returned no valid rows for request. url=${url.toString()} result_snippet=${snippet}`,
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

const HOUR_IN_MS = 1000 * 60 * 60;
// const DAY_IN_MS = HOUR_IN_MS * 24;

export const restaurantQueries = {
	list: (params?: RestaurantSearchParams) => {
		return queryOptions({
			queryKey: ["restaurants", params],
			queryFn: () => getRestaurantsFn({ data: params }),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
			placeholderData: keepPreviousData,
		});
	},
	infiniteList: (
		// For table usage, allow callers to pass pagination params including
		// an optional $limit. We no longer compute limits from a zoom hint.
		params?: Omit<RestaurantSearchParams, "$offset">,
	) => {
		return infiniteQueryOptions({
			queryKey: ["restaurants", "infinite", params],
			queryFn: ({ pageParam }) => {
				// Respect caller-provided $limit when present; otherwise use a
				// sensible default. Enforce the same hard caps as before.
				const callerLimit = (params as Record<string, unknown>)?.$limit;
				const parsedLimit =
					typeof callerLimit === "number"
						? callerLimit
						: typeof callerLimit === "string"
							? Number(callerLimit)
							: undefined;

				const defaultLimit = 1000; // conservative default for table pagination
				// For table infinite queries we default to and cap at 1000 to avoid
				// huge payloads. Other views (chart/map) should use `list` or
				// compute their own limits as needed.
				const finalLimit = Math.min(
					1000,
					Math.max(100, parsedLimit ?? defaultLimit),
				);

				return getRestaurantsFn({
					data: { ...params, $offset: pageParam, $limit: finalLimit },
				});
			},
			initialPageParam: 0,
			getNextPageParam: (lastPage) => lastPage.nextOffset,
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
			placeholderData: keepPreviousData,
		});
	},
	detail: (camis: string) => {
		return queryOptions({
			queryKey: ["restaurants", "detail", camis],
			queryFn: () => getRestaurantsFn({ data: { camis } }),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		});
	},
};
