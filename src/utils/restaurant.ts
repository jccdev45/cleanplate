import { groupRestaurants } from "@/lib/utils";
import {
	type RestaurantRaw,
	type RestaurantSearchParams,
	restaurantApiResponseSchema,
	restaurantRawSchema,
	restaurantSearchParamsSchema,
} from "@/schema/schema";
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

		// Helper: strip surrounding quotes and whitespace
		const stripQuotes = (v: unknown) => {
			if (v === undefined || v === null) return undefined;
			const s = String(v).trim();
			return s.replace(/^"+|"+$/g, "");
		};

		// Helper: parse number safely after stripping quotes
		const parseNum = (v: unknown) => {
			const s = stripQuotes(v);
			if (s === undefined) return undefined;
			const n = Number(s);
			return Number.isFinite(n) ? n : undefined;
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

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});
		if (!response.ok) {
			const text = await response.text();
			throw new Error(
				`Socrata request failed: ${response.status} ${response.statusText} url=${url.toString()} body=${text.slice(0, 1000)}`,
			);
		}

		const result = await response.json();

		// Validate API response is an array of restaurant objects
		let rawRows: RestaurantRaw[];
		try {
			if (markerOnly) {
				// marker-only responses return a trimmed set of fields; accept partial rows
				rawRows = (await import("zod")).z
					.array(restaurantRawSchema.partial())
					.parse(result) as RestaurantRaw[];
			} else {
				rawRows = restaurantApiResponseSchema.parse(result);
			}
		} catch (err) {
			const snippet =
				typeof result === "string"
					? result.slice(0, 1000)
					: JSON.stringify(result).slice(0, 1000);
			throw new Error(
				`API response was not an array of restaurant objects. url=${url.toString()} result_snippet=${snippet}`,
			);
		}
		// Transform/group
		const restaurants = groupRestaurants(rawRows);
		// return grouped restaurants

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

// Export a small helper so the client can compute the same $limit used server-side
export function computeLimitFromZoom(zoom?: number) {
	if (typeof zoom !== "number" || !Number.isFinite(zoom)) return 3000;
	const z = zoom;
	if (z <= 4) return 3000;
	if (z <= 8) return 3000;
	if (z <= 11) return 1500;
	if (z <= 14) return 800;
	return 500;
}
