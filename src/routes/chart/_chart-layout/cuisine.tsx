import { CuisineBarChart } from "@/components/charts/cuisine-bar-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/chart/_chart-layout/cuisine")({
	// TODO: Add `head` for metadata
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.cuisineCounts({ topN: 100 }),
		);
	},
	component: CuisineRoute,
});

function CuisineRoute() {
	const { data } = useSuspenseQuery(
		restaurantQueries.cuisineCounts({ topN: 12 }),
	);
	if (!data) return <DefaultLoader text="Loading cuisine counts..." />;
	// data may be in two shapes depending on whether server aggregation returned data:
	// - { data: Array<{ cuisine, count }> }
	// - fallback: { restaurants: Restaurant[] }
	const cuisineChartData = React.useMemo(() => {
		if (typeof data === "object") {
			const obj = data as Record<string, unknown>;
			if (Array.isArray(obj.data))
				return obj.data as Array<{ cuisine: string; count: number }>;
		}

		// fallback: aggregate restaurants list
		const counts: Record<string, number> = {};
		const restaurants = (data as Record<string, unknown>)?.restaurants as
			| Array<Record<string, unknown>>
			| undefined;
		if (!Array.isArray(restaurants)) return [];
		for (const r of restaurants) {
			const cuisine = (r.cuisine_description as string) || "Other";
			counts[cuisine] = (counts[cuisine] || 0) + 1;
		}
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 12)
			.map(([cuisine, count]) => ({ cuisine, count }));
	}, [data]);

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Cuisine Counts</h1>

			<Alert className="mb-6">
				<AlertTitle>About these counts</AlertTitle>
				<AlertDescription>
					Counts reflect the number of restaurants in the dataset with a given
					cuisine description (top results shown). Server-side aggregation is
					used when available; otherwise the counts are computed from the
					returned restaurant list.
				</AlertDescription>
			</Alert>

			<CuisineBarChart data={cuisineChartData} />
		</section>
	);
}
