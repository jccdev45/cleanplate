import { GradePieChart } from "@/components/charts/grade-pie-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import type { Restaurant } from "@/types/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/chart/_chart-layout/grade")({
	// TODO: Add `head` for metadata
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.gradeDistribution(),
		);
	},
	component: GradeRoute,
});

function GradeRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.gradeDistribution());
	if (!data) return <DefaultLoader text="Loading grade distribution..." />;

	const gradeData = React.useMemo(() => {
		if (
			data &&
			typeof data === "object" &&
			Array.isArray((data as unknown as Record<string, unknown>).data)
		) {
			return (
				data as unknown as { data: Array<{ grade: string; count: number }> }
			).data;
		}
		const counts: Record<string, number> = {};
		const restaurants =
			(data as unknown as { restaurants?: Array<Restaurant> })?.restaurants ??
			[];
		for (const r of restaurants) {
			const grade = (r.inspections?.[0]?.grade as string) || "N/A";
			counts[grade] = (counts[grade] || 0) + 1;
		}
		return Object.entries(counts)
			.sort((a, b) => (a[0] < b[0] ? -1 : 1))
			.map(([grade, count]) => ({ grade, count }));
	}, [data]);

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Grade Distribution</h1>
			<div className="flex justify-center">
				<GradePieChart data={gradeData} />
			</div>
		</section>
	);
}
