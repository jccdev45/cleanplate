import { CuisineBarChart } from "@/components/charts/cuisine-bar-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/chart/_chart-layout/cuisine")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.cuisineCounts({ $limit: 10000 }),
		);
	},
	component: CuisineRoute,
});

function CuisineRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.cuisineCounts());
	if (!data) return <DefaultLoader text="Loading cuisine counts..." />;

	const cuisineChartData = React.useMemo(() => {
		const counts: Record<string, number> = {};
		for (const r of data.restaurants) {
			const cuisine = r.cuisine_description || "Other";
			counts[cuisine] = (counts[cuisine] || 0) + 1;
		}
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 12)
			.map(([cuisine, count]) => ({ cuisine, count }));
	}, [data.restaurants]);

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Cuisine Counts</h1>
			<CuisineBarChart data={cuisineChartData} />
		</section>
	);
}
