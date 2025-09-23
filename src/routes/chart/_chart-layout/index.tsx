import { StatsStrip } from "@/components/landing/stats-strip";
import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chart/_chart-layout/")({
	// TODO: Add `head` for metadata
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.dashboardStats(),
		);
	},
	component: RouteComponent,
});

type DashboardStats = {
	totalRestaurants?: number;
	avgScore?: number | null;
	totalCuisines?: number;
	pctGradeA?: number;
	pctCritical?: number;
	topCuisines?: Array<{ cuisine: string; count?: number }>;
};

function RouteComponent() {
	const { data, isLoading } = useSuspenseQuery(
		restaurantQueries.dashboardStats(),
	);
	if (isLoading) return <DefaultLoader text="Loading chart data..." />;

	// server shape: { totalRestaurants, avgScore, totalCuisines, pctGradeA, pctCritical, topCuisines }
	const stats = (data as unknown as DashboardStats) ?? {};
	const totalRestaurants = stats.totalRestaurants;
	const avgScore = stats.avgScore;
	const totalCuisines = stats.totalCuisines;
	const pctGradeA = stats.pctGradeA;
	const pctCritical = stats.pctCritical;
	const topCuisines = stats.topCuisines;

	return (
		<section className="">
			<div className="text-center mb-6">
				<h1 className="text-2xl font-bold">Restaurant Data Dashboard</h1>
				<p className="text-sm text-muted-foreground">Overview and charts</p>
			</div>

			<StatsStrip
				avgScore={avgScore?.toFixed ? avgScore.toFixed(1) : (avgScore ?? "N/A")}
				totalCuisines={totalCuisines}
				percentageGradeA={
					pctGradeA?.toFixed ? pctGradeA.toFixed(1) : (pctGradeA ?? "0.0")
				}
				totalRestaurants={totalRestaurants}
				percentageCritical={pctCritical}
				topCuisines={topCuisines ?? []}
			/>

			<div className="mt-6 max-w-3xl mx-auto text-sm text-muted-foreground">
				<p>
					This dashboard surfaces high-level statistics computed from the NYC
					inspections dataset. Use the charts below to explore how inspections
					vary across boroughs, cuisines, and time.
				</p>
				<p className="mt-3">
					Quick tips: use the filters on the map page to narrow by year or
					neighborhood, or open a restaurant card to view inspection history and
					violations.
				</p>
			</div>
		</section>
	);
}
