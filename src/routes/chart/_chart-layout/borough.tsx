import { BoroughBarChart } from "@/components/charts/borough-bar-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/chart/_chart-layout/borough")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.boroughCounts({ $limit: 10000 }),
		);
	},
	component: BoroughRoute,
});

function BoroughRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.boroughCounts());
	if (!data) return <DefaultLoader text="Loading borough counts..." />;

	const boroughData = React.useMemo(() => {
		const counts: Record<string, number> = {};
		for (const r of data.restaurants) {
			const boro = r.boro || "Other";
			counts[boro] = (counts[boro] || 0) + 1;
		}
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([boro, count]) => ({ boro, count }));
	}, [data.restaurants]);

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Borough Counts</h1>
			<BoroughBarChart data={boroughData} />
		</section>
	);
}
