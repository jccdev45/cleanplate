import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chart/_chart-layout/critical")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.criticalFlagDistribution({ $limit: 10000 }),
		);
	},
	component: CriticalRoute,
});

function CriticalRoute() {
	const { data } = useSuspenseQuery(
		restaurantQueries.criticalFlagDistribution(),
	);
	if (!data) return <DefaultLoader text="Loading critical flags..." />;

	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Critical Flag Distribution</h1>
			<pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
		</section>
	);
}
