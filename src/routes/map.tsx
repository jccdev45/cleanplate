import { MapFilters } from "@/components/map-filters";
import { RestaurantMap } from "@/components/restaurant-map";
import { restaurantSearchSchema } from "@/schema/schema";
import { restaurantQueries } from "@/utils/restaurant";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/map")({
	component: MapPage,
	validateSearch: (search) => restaurantSearchSchema.parse(search),
	ssr: "data-only",
});

function MapPage() {
	const searchParams = useSearch({ from: "/map" });
	const { data, isLoading, isFetching, error } = useQuery(
		restaurantQueries.list(searchParams),
	);

	return (
		<div className="flex flex-col h-[calc(100vh-64px)]">
			<MapFilters />
			<h1 className="text-xl font-bold text-center p-2">
				Displaying {data?.count ?? 0} results
			</h1>
			<main className="flex-grow relative">
				{/* Initial Load: Full overlay */}
				{isLoading && (
					<div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				)}

				{/* Refetching: Subtle indicator */}
				{isFetching && !isLoading && (
					<div className="absolute top-4 right-4 z-50 bg-white/80 p-2 rounded-full shadow-lg">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				)}

				{error && (
					<div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center text-red-600">
						Error loading map data
					</div>
				)}
				<RestaurantMap restaurants={data?.restaurants || []} />
			</main>
		</div>
	);
}
