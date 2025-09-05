import { groupRestaurants } from "@/lib/utils";
import {
	type RestaurantRaw,
	type RestaurantSearchParams,
	restaurantApiResponseSchema,
	restaurantSearchParamsSchema,
} from "@/schema/schema";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

const appToken = process.env.RESTAURANT_API_APP_TOKEN;

export const getRestaurantsFn = createServerFn({ method: "GET" })
	// Accept strong params via Zod. This allows map-specific params to exist in the URL
	.validator((val) => restaurantSearchParamsSchema.parse(val))
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";

		// Parse the incoming data with the strict API schema to strip out non-API params
		// const apiParams = apiSchema.parse(data);

		// Default to a high limit if none is provided to get a large dataset
		// const paramsWithLimit = { $limit: 5000, ...apiParams };

		// Construct URL with query parameters
		const url = new URL(BASE_URL);
		// Convert all params to string before passing to URLSearchParams
		const stringifiedParams = Object.fromEntries(
			Object.entries({ ...data }).map(([key, value]) => {
				if (value === undefined) return [key, ""];
				return [key, String(value)];
			}),
		);
		if (stringifiedParams) {
			url.search = new URLSearchParams(stringifiedParams).toString();
		}

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});
		const result = await response.json();

		// Validate API response is an array of restaurant objects
		let rawRows: RestaurantRaw[];
		try {
			rawRows = restaurantApiResponseSchema.parse(result);
		} catch (err) {
			throw new Error(
				"API response was not an array of restaurant objects. Check Socrata API and schema.",
			);
		}
		// Transform/group
		const restaurants = groupRestaurants(rawRows);

		return { restaurants, count: restaurants.length };
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
