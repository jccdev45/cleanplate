import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chart/_chart-layout/cuisine")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.cuisineCounts({ $limit: 10000 }),
		);
	},
	component: CuisineRoute,
});

function CuisineRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.cuisineCounts());
	if (!data) return <DefaultLoader text="Loading cuisine counts..." />;

	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Cuisine Counts</h1>
			<pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
		</section>
	);
}
