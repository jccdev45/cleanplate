import { CriticalFlagPieChart } from "@/components/charts/critical-flag-pie-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { restaurantQueries } from "@/queries/restaurant";
import type { Restaurant } from "@/types/restaurant";
import { seo } from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = process.env.SITE_URL ?? "";
import React from "react";

export const Route = createFileRoute("/chart/_chart-layout/critical")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.criticalFlagDistribution(),
		);
	},
	head: () => ({
		meta: seo({
			title: "Critical Flags",
			description:
				"Distribution of critical (sanitary) flags across inspections.",
			image: SITE_URL ? `${SITE_URL}/chart-critical.png` : undefined,
			url: SITE_URL ? `${SITE_URL}/chart/critical` : undefined,
		}),
	}),
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

			<Alert className="mb-6">
				<AlertTitle>About critical flags</AlertTitle>
				<AlertDescription>
					Critical (sanitary) violations are issued when the safety of the food
					being prepared and served is threatened. These are the most important
					inspection findings and are scored as sanitary violations. Examples
					include unsafe food temperatures or evidence of pests. This chart
					shows the distribution of critical-flag values found on the most
					recent inspections.
				</AlertDescription>
			</Alert>

			<div className="flex justify-center">
				<CriticalFlagPieChart data={flagData} />
			</div>
		</section>
	);
}
