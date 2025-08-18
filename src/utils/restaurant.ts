import { groupRestaurants } from "@/lib/utils";
import {
	nycRawInspectionSchema,
	restaurantSearchSchema,
} from "@/schema/schema";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const appToken = process.env.NYC_DATA_APP_TOKEN;

// Accept strong params via Zod
export const getRestaurants = createServerFn({ method: "GET" })
	.validator((val) => restaurantSearchSchema.parse(val))
	.handler(async ({ data }) => {
		console.log("🚀 ~ data:", data);
		const BASE_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
		const response = await fetch(BASE_URL, {
			headers: {
				Accept: "application/json",
				...(appToken ? { "X-App-Token": appToken } : {}),
			},
			body: data
				? new URLSearchParams(data as Record<string, string>)
				: undefined,
		});
		const result = await response.json();

		// Validate every row
		const rawRows = z.array(nycRawInspectionSchema).parse(result);
		// Transform/group
		const restaurants = groupRestaurants(rawRows);

		return { restaurants, count: restaurants.length };
	});
