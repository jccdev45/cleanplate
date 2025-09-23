import { CriticalFlagPieChart } from "@/components/charts/critical-flag-pie-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import type { Restaurant } from "@/types/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/chart/_chart-layout/critical")({
	// TODO: Add `head` for metadata
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.criticalFlagDistribution(),
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
		if (
			data &&
			typeof data === "object" &&
			Array.isArray((data as unknown as Record<string, unknown>).data)
		) {
			return (
				data as unknown as { data: Array<{ name: string; value: number }> }
			).data;
		}
		const counts: Record<string, number> = {};
		const restaurants =
			(data as unknown as { restaurants?: Array<Restaurant> })?.restaurants ??
			[];
		for (const r of restaurants) {
			const flag =
				(r.inspections?.[0]?.critical_flag as string) || "Not Applicable";
			counts[flag] = (counts[flag] || 0) + 1;
		}
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([name, value]) => ({ name, value }));
	}, [data]);

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Critical Flag Distribution</h1>
			<div className="flex justify-center">
				<CriticalFlagPieChart data={flagData} />
			</div>
		</section>
	);
}
