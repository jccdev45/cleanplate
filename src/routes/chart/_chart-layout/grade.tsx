import { GradePieChart } from "@/components/charts/grade-pie-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SITE_URL } from "@/lib/constants";
import { restaurantQueries } from "@/queries/restaurant";
import type { Restaurant } from "@/types/restaurant";
import { seo } from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/chart/_chart-layout/grade")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.gradeDistribution(),
		);
	},
	head: () => ({
		meta: seo({
			title: "Grade Distribution",
			description: "Distribution of restaurant letter grades (A/B/C/P/Z/N/A).",
			image: SITE_URL ? `${SITE_URL}/chart-grade.png` : undefined,
			url: SITE_URL ? `${SITE_URL}/chart/grade` : undefined,
		}),
	}),
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

			<Alert className="mb-6">
				<AlertTitle>How grades are determined</AlertTitle>
				<AlertDescription>
					Violations flagged as sanitary carry point values; a restaurant's
					score maps to a letter grade. The cut-offs are:
					<ul className="list-disc ml-5 mt-2">
						<li>A: 0–13 points</li>
						<li>B: 14–27 points</li>
						<li>C: 28+ points</li>
					</ul>
					Some inspections show special grade codes: N = Not Yet Graded; Z =
					Grade Pending; P = Grade Pending issued on re-opening after a closure.
					This chart shows the latest grade recorded for each restaurant.
				</AlertDescription>
			</Alert>

			<div className="flex justify-center">
				<GradePieChart data={gradeData} />
			</div>
		</section>
	);
}
