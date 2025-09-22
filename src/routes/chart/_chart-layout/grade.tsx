import { DefaultLoader } from "@/components/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chart/_chart-layout/grade")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.gradeDistribution({ $limit: 10000 }),
		)
	},
	component: GradeRoute,
});

function GradeRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.gradeDistribution());
	if (!data) return <DefaultLoader text="Loading grade distribution..." />;

	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Grade Distribution</h1>
			<pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
		</section>
	)
}
