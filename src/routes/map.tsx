import { MapFilters } from "@/components/map-filters";
import { RestaurantMap } from "@/components/restaurant-map";
import { restaurantSearchParamsSchema } from "@/schema/schema";
import { restaurantQueries } from "@/utils/restaurant";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/map")({
	component: MapPage,
	validateSearch: (search) => restaurantSearchParamsSchema.parse(search),
	ssr: "data-only",
});

function MapPage() {
	const searchParams = Route.useSearch();
	const { data, error, isFetching, isLoading } = useQuery(
		restaurantQueries.list(searchParams),
	);

	return (
		<div className="flex flex-col h-[calc(100vh-64px)]">
			<div className="flex items-center px-4">
				<MapFilters />
				<div className="flex flex-col flex-1 text-center p-2">
					<h1 className="text-xl font-bold mb-2">
						Displaying {data?.count ?? 0} results
					</h1>
					<AppliedFilters searchParams={searchParams} />
				</div>
			</div>
			<main className="flex-grow relative">
				{/* Initial Load: Full overlay */}
				{isLoading && (
					<div className="absolute inset-0 size-full bg-white/70 z-50 flex items-center justify-center">
						<Loader2 className="size-12 animate-spin text-primary" />
					</div>
				)}

				{/* Refetching: Subtle indicator */}
				{isFetching && !isLoading && (
					<div className="absolute top-4 right-4 z-50 bg-white/80 p-2 rounded-full shadow-lg">
						<Loader2 className="size-6 animate-spin text-primary" />
					</div>
				)}

				{error && (
					<div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
						<span className="bg-destructive/60 p-2 rounded text-destructive-foreground">
							Error loading map data
						</span>
					</div>
				)}
				<RestaurantMap restaurants={data?.restaurants || []} />
			</main>
		</div>
	);
	// AppliedFilters component displays a summary of active filters
	function AppliedFilters({
		searchParams,
	}: { searchParams: Record<string, unknown> }) {
		const filters: Array<{ label: string; value: string }> = [];

		if (searchParams?.$q)
			filters.push({ label: "Search", value: String(searchParams.$q) });
		if (searchParams?.grade)
			filters.push({ label: "Grade", value: String(searchParams.grade) });
		if (searchParams?.$limit)
			filters.push({ label: "Limit", value: String(searchParams.$limit) });
		if (searchParams?.boro)
			filters.push({ label: "Borough", value: String(searchParams.boro) });
		if (searchParams?.$order) {
			const orderValue = String(searchParams.$order);
			const readableOrder =
				orderValue === "inspection_date DESC"
					? "Newest"
					: orderValue === "inspection_date ASC"
						? "Oldest"
						: orderValue;
			filters.push({
				label: "Sort by",
				value: readableOrder,
			});
		}
		if (searchParams?.critical_flag) {
			filters.push({
				label: "Critical Flag",
				value: String(searchParams.critical_flag),
			});
		}

		if (filters.length === 0) {
			return (
				<span className="text-muted-foreground text-sm">
					No filters applied
				</span>
			);
		}

		return (
			<div className="flex flex-wrap gap-2 justify-center text-sm">
				{filters.map((f) => (
					<span
						key={f.label}
						className="px-2 py-1 rounded bg-accent text-accent-foreground"
					>
						{f.label}:{" "}
						<span className="font-semibold text-primary-foreground">
							{f.value}
						</span>
					</span>
				))}
			</div>
		);
	}
}
