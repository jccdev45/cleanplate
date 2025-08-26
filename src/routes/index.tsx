import { TopRestaurants } from "@/components/top-restaurants";
import { WorstRestaurants } from "@/components/worst-restaurants";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="container mx-auto py-8">
			<section className="text-center mb-12">
				<h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
					Clean Plate
				</h1>
				<p className="text-lg text-muted-foreground mt-2">
					Your guide to restaurant health inspections in New York City.
				</p>
				{/* TODO: Add search bar here */}
			</section>

			<section className="mb-12">
				<h2 className="text-2xl font-semibold tracking-tight">
					Top Rated Restaurants
				</h2>
				<p className="mb-4 text-sm text-muted-foreground">
					These restaurants have received a grade of A in their most recent
					inspection.
				</p>
				<TopRestaurants />
			</section>

			<section>
				<h2 className="text-2xl font-semibold tracking-tight">
					Restaurants to Watch (Out For)
				</h2>
				<p className="mb-4 text-sm text-muted-foreground">
					These restaurants have received a grade of C or worse in their most
					recent inspection.
				</p>
				<WorstRestaurants />
			</section>
		</div>
	);
}
