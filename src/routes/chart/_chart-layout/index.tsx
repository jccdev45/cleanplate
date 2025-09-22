import { DefaultLoader } from "@/components/default-loader";
import { StatsStrip } from "@/components/stats-strip";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const $limit = 10000;

export const Route = createFileRoute("/chart/_chart-layout/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.list({ $limit }),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isLoading } = useSuspenseQuery(
		restaurantQueries.list({ $limit }),
	);
	if (isLoading) return <DefaultLoader text="Loading chart data..." />;

	const scores: number[] = [];
	let totalCuisines = 0;
	let gradeACount = 0;

	if (data) {
		const cuisineSet = new Set<string>();
		for (const r of data.restaurants) {
			cuisineSet.add(r.cuisine_description || "Other");
			const score = r.inspections[0]?.score;
			if (score !== undefined && score !== null && Number.isFinite(score))
				scores.push(score);
			const grade = r.inspections[0]?.grade;
			if (grade === "A") gradeACount += 1;
		}
		totalCuisines = cuisineSet.size;
	}

	const avgScore = scores.length
		? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
		: "N/A";
	const percentageA = data
		? ((gradeACount / data.restaurants.length) * 100).toFixed(1)
		: "0.0";

	return (
		<section className="p-6">
			<div className="text-center mb-6">
				<h1 className="text-2xl font-bold">Restaurant Data Dashboard</h1>
				<p className="text-sm text-muted-foreground">Overview and charts</p>
			</div>
			<StatsStrip
				avgScore={avgScore}
				totalCuisines={totalCuisines}
				percentageGradeA={percentageA}
			/>
			<section className="mb-6">
				<p className="text-center text-muted-foreground">
					Charts are available below (phase 1 overview). Use the Chart page
					navigation to view each chart.
				</p>
			</section>
		</section>
	);
}
