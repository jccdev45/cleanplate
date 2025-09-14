import { RestaurantCard } from "@/components/restaurant-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoaderData } from "@tanstack/react-router";

export function WorstRestaurants() {
	const { worst } = useLoaderData({ from: "/" });

	return (
		<section className="mb-16 animate-in fade-in duration-700">
			<h2 className="text-2xl font-semibold tracking-tight font-serif mb-2">
				Restaurants to Watch (Out For)
			</h2>
			<p className="mb-4 text-sm text-muted-foreground">
				These restaurants have received a grade of C or worse in their most
				recent inspection.
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{worst
					? worst.map((r) => <RestaurantCard key={r.camis} restaurant={r} />)
					: Array.from({ length: 6 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<Skeleton key={i} className="h-48" />
						))}
			</div>
		</section>
	);
}
