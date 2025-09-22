import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chart/_chart-layout/score")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.scoreHistogram({ $limit: 10000 }),
		);
	},
	component: ScoreRoute,
});

function ScoreRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.scoreHistogram());
	if (!data) return <DefaultLoader text="Loading score histogram..." />;

	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Score Histogram</h1>
			<pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
		</section>
	);
}
