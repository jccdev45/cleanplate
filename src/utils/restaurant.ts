import { groupRestaurants } from "@/lib/utils";
import {
	type RestaurantSearchParams,
	nycRawInspectionSchema,
	restaurantSearchSchema,
} from "@/schema/schema";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const appToken = process.env.NYC_DATA_APP_TOKEN;

export const getRestaurantsFn = createServerFn({ method: "GET" })
	// Accept strong params via Zod
	.validator((val) => restaurantSearchSchema.parse(val))
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";

		// Construct URL with query parameters
		const url = new URL(BASE_URL);
		if (data) {
			url.search = new URLSearchParams(
				data as Record<string, string>,
			).toString();
		}

		const response = await fetch(url.toString(), {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
		});
		const result = await response.json();

		// Validate every row
		const rawRows = z.array(nycRawInspectionSchema).parse(result);
		// Transform/group
		const restaurants = groupRestaurants(rawRows);

		return { restaurants, count: restaurants.length };
	});

export const restaurantQueries = {
	list: (params: RestaurantSearchParams) => {
		return queryOptions({
			queryKey: ["restaurants", params],
			queryFn: () => getRestaurantsFn({ data: params }),
		});
	},
	detail: (camis: string) => {
		return queryOptions({
			queryKey: ["restaurants", "detail", camis],
			queryFn: () => getRestaurantsFn({ data: { camis } }),
		});
	},
};
