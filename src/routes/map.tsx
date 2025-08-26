import { RestaurantMap } from "@/components/restaurant-map";
import { restaurantQueries } from "@/utils/restaurant";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/map")({
	component: MapPage,
	ssr: "data-only",
});

function MapPage() {
	const { data, isLoading, error } = useQuery(restaurantQueries.list({}));

	if (isLoading) return <div className="p-8 text-center">Loading map...</div>;
	if (error)
		return (
			<div className="p-8 text-center text-red-600">Error loading map</div>
		);

	return (
		<main className="flex flex-col items-center px-2 py-4 w-full h-[calc(100vh-64px)]">
			<h1 className="text-2xl font-bold mb-4">NYC Restaurant Map</h1>
			<RestaurantMap restaurants={data?.restaurants || []} />
		</main>
	);
}
