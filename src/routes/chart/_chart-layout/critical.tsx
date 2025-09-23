import { CriticalFlagPieChart } from "@/components/charts/critical-flag-pie-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

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

	const flagData = React.useMemo(() => {
		const counts: Record<string, number> = {};
		for (const r of data.restaurants) {
			const flag = r.inspections[0]?.critical_flag || "Not Applicable";
			counts[flag] = (counts[flag] || 0) + 1;
		}
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([name, value]) => ({ name, value }));
	}, [data.restaurants]);

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Critical Flag Distribution</h1>
			<div className="flex justify-center">
				<CriticalFlagPieChart data={flagData} />
			</div>
		</section>
	);
}
