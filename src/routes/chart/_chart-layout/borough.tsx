import { BoroughBarChart } from "@/components/charts/borough-bar-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SITE_URL } from "@/lib/constants";
import { restaurantQueries } from "@/queries/restaurant";
import { seo } from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/chart/_chart-layout/borough")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.boroughCounts(),
		);
	},
	head: () => ({
		meta: seo({
			title: "Borough Counts",
			description: "Counts of restaurants by NYC borough.",
			image: SITE_URL ? `${SITE_URL}/chart-borough.png` : undefined,
			url: SITE_URL ? `${SITE_URL}/chart/borough` : undefined,
		}),
	}),
	component: BoroughRoute,
});

function BoroughRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.boroughCounts());
	if (!data) return <DefaultLoader text="Loading borough counts..." />;

	// Server shape: { data: Array<{ boro, count }> }
	const boroughData = useMemo(() => {
		if (
			data &&
			typeof data === "object" &&
			Array.isArray((data as unknown as Record<string, unknown>).data)
		) {
			return (
				data as unknown as { data: Array<{ boro: string; count: number }> }
			).data;
		}
		const counts: Record<string, number> = {};
		const restaurants = (data as unknown as Record<string, unknown> | undefined)
			?.restaurants as Array<Record<string, unknown>> | undefined;
		for (const r of restaurants ?? []) {
			const boro = (r.boro as string) || "Other";
			counts[boro] = (counts[boro] || 0) + 1;
		}
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([boro, count]) => ({ boro, count }));
	}, [data]);

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Borough Counts</h1>

			<Alert className="mb-6">
				<AlertTitle>About borough counts</AlertTitle>
				<AlertDescription>
					These counts reflect how many restaurants in the dataset are
					associated with each borough value. Some records may use alternate or
					missing borough values; results are based on the most recent
					inspection record available for each restaurant.
				</AlertDescription>
			</Alert>

			<BoroughBarChart data={boroughData} />
		</section>
	);
}
