import { GradePieChart } from "@/components/charts/grade-pie-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/chart/_chart-layout/grade")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.gradeDistribution({ $limit: 10000 }),
		);
	},
	component: GradeRoute,
});

function GradeRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.gradeDistribution());
	if (!data) return <DefaultLoader text="Loading grade distribution..." />;

	const gradeData = React.useMemo(() => {
		const counts: Record<string, number> = {};
		for (const r of data.restaurants) {
			const grade = r.inspections[0]?.grade || "N/A";
			counts[grade] = (counts[grade] || 0) + 1;
		}
		return Object.entries(counts)
			.sort((a, b) => (a[0] < b[0] ? -1 : 1))
			.map(([grade, count]) => ({ grade, count }));
	}, [data.restaurants]);

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Grade Distribution</h1>
			<div className="flex justify-center">
				<GradePieChart data={gradeData} />
			</div>
		</section>
	);
}
