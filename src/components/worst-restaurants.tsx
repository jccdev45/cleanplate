import { RestaurantCard } from "@/components/restaurant-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoaderData } from "@tanstack/react-router";

export function WorstRestaurants() {
	const { worst } = useLoaderData({ from: "/" });

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{worst
				? worst.map((r) => <RestaurantCard key={r.camis} restaurant={r} />)
				: Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<Skeleton key={i} className="h-48" />
					))}
		</div>
	);
}
