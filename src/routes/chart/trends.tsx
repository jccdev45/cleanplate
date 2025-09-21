import { CuisineTrendsAreaChart } from "@/components/charts/cuisine-trends-area-chart";
import { DefaultLoader } from "@/components/default-loader";
import { GenericErrorComponent } from "@/components/generic-error";
import { SITE_NAME } from "@/lib/constants";
import {
	aggregateCuisineTrends,
	safeExtractRestaurants,
} from "@/utils/aggregate-inspections";
import { restaurantQueries } from "@/utils/restaurant";
import seo from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/chart/trends")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.list({ $limit: 10000 }),
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
	const { data: raw } = useSuspenseQuery(
		restaurantQueries.list({ $limit: 10000 }),
	);

	if (!raw) return <DefaultLoader text="Loading trends..." />;

	const restaurants = safeExtractRestaurants(raw);
	const { data, topCuisines } = aggregateCuisineTrends(restaurants, 6);

	return (
		<main className="p-6">
			<h1 className="text-2xl font-bold mb-4">Cuisine Trends</h1>
			<CuisineTrendsAreaChart data={data} topCuisines={topCuisines} />
		</main>
	);
}
