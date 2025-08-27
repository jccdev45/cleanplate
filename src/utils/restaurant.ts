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

// This schema defines only the parameters that the Socrata API accepts.
const apiSchema = restaurantSearchSchema.unwrap().pick({
	$limit: true,
	$offset: true,
	$order: true,
	$q: true,
	$where: true,
	boro: true,
	camis: true,
	critical_flag: true,
	dba: true,
	grade: true,
	inspection_date: true,
	score: true,
	zipcode: true,
});

export const getRestaurantsFn = createServerFn({ method: "GET" })
	// Accept strong params via Zod. This allows map-specific params to exist in the URL
	.validator((val) => restaurantSearchSchema.parse(val))
	.handler(async ({ data }) => {
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";

		// Parse the incoming data with the strict API schema to strip out non-API params
		const apiParams = apiSchema.parse(data);

		// Default to a high limit if none is provided to get a large dataset
		const paramsWithLimit = { $limit: 10000, ...apiParams };

		// Construct URL with query parameters
		const url = new URL(BASE_URL);
		// Convert all params to string before passing to URLSearchParams
		const stringifiedParams = Object.fromEntries(
			Object.entries(paramsWithLimit).map(([key, value]) => {
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
