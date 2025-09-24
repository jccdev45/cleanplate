import { CuisineTrendsAreaChart } from "@/components/charts/cuisine-trends-area-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { GenericErrorComponent } from "@/components/shared/generic-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SITE_URL } from "@/lib/constants";
import { restaurantQueries } from "@/queries/restaurant";
import { seo } from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chart/_chart-layout/trends")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.trendsAggregate({ topNumber: 6 }),
		);
	},
	head: () => ({
		meta: seo({
			title: "Trends",
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
		restaurantQueries.trendsAggregate({ topNumber: 6 }),
	);

	if (!serverAgg) return <DefaultLoader text="Loading trends..." />;

	const { data: rawData, topCuisines } = serverAgg as unknown as {
		data: Array<Record<string, string | number>>;
		topCuisines: string[];
	};
	const data = rawData;

	return (
		<main className="p-6">
			<h1 className="text-2xl font-bold mb-4">Cuisine Trends</h1>

			<Alert className="mb-6">
				<AlertTitle>Trends explanation</AlertTitle>
				<AlertDescription>
					This chart shows how the top cuisines' representation changes over
					time based on inspection records.
				</AlertDescription>
			</Alert>

			<CuisineTrendsAreaChart data={data} topCuisines={topCuisines} />
		</main>
	);
}
