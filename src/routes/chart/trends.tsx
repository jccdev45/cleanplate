import { CuisineTrendsAreaChart } from "@/components/charts/cuisine-trends-area-chart";
import { DefaultLoader } from "@/components/default-loader";
import { GenericErrorComponent } from "@/components/generic-error";
import { SITE_NAME } from "@/lib/constants";
// server-side aggregation is used; local aggregation helpers are no longer required here
import { restaurantQueries } from "@/utils/restaurant";
import seo from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/chart/trends")({
	loader: async ({ context }) => {
		// Prefetch the aggregated trends to avoid fetching the full restaurants list
		await context.queryClient.ensureQueryData(
			restaurantQueries.trendsAggregate({ topN: 6 }),
		);
	},
	head: () => ({
		meta: seo({
			title: `Trends | ${SITE_NAME}`,
			description: "Cuisine trends over time.",
			image: SITE_URL ? `${SITE_URL}/images/cosmic-diner.jpg` : undefined,
			url: SITE_URL ? `${SITE_URL}/chart/trends` : undefined,
		}),
	}),
	errorComponent: (props) => (
		<GenericErrorComponent {...props} title="trends" />
	),
	component: TrendsRoute,
});

function TrendsRoute() {
	const { data: serverAgg } = useSuspenseQuery(
		restaurantQueries.trendsAggregate({ topN: 6 }),
	);

	if (!serverAgg) return <DefaultLoader text="Loading trends..." />;

	// serverAgg has shape { data, topCuisines }
	const { data: rawData, topCuisines } = serverAgg as unknown as {
		data: Array<Record<string, string | number>>;
		topCuisines: string[];
	};
	const data = rawData;

	return (
		<main className="p-6">
			<h1 className="text-2xl font-bold mb-4">Cuisine Trends</h1>
			<CuisineTrendsAreaChart data={data} topCuisines={topCuisines} />
		</main>
	);
}
