import { RestaurantList } from "@/components/landing/restaurant-list";
import type { Restaurant } from "@/types/restaurant";
import { useLoaderData } from "@tanstack/react-router";

export function TopRestaurants() {
	const loaderData = useLoaderData({ from: "/" }) as
		| { top?: Restaurant[]; remoteDown?: boolean }
		| undefined;

	return (
		<RestaurantList
			title="Top Rated Restaurants"
			description="These restaurants have received a grade of A in their most recent inspection."
			items={loaderData?.top}
			remoteDown={Boolean(loaderData?.remoteDown)}
		/>
	);
}
