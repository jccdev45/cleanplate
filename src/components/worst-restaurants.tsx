import { RestaurantList } from "@/components/restaurant-list";
import type { Restaurant } from "@/types/restaurant";
import { useLoaderData } from "@tanstack/react-router";

export function WorstRestaurants() {
	const loaderData = useLoaderData({ from: "/" }) as
		| { worst?: Restaurant[]; remoteDown?: boolean }
		| undefined;

	return (
		<RestaurantList
			title="Restaurants to Watch (Out For)"
			description="These restaurants have received a grade of C or worse in their most recent inspection."
			items={loaderData?.worst}
			remoteDown={Boolean(loaderData?.remoteDown)}
		/>
	);
}
