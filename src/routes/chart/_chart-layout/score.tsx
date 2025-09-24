import { ScoreBarChart } from "@/components/charts/score-bar-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { restaurantQueries } from "@/queries/restaurant";
import type { Restaurant } from "@/types/restaurant";
import { seo } from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/chart/_chart-layout/score")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.scoreHistogram(),
		);
	},
	head: () => ({
		meta: seo({
			title: "Scores",
			description: "Score distribution histogram for restaurants.",
			image: SITE_URL ? `${SITE_URL}/chart-score.png` : undefined,
			url: SITE_URL ? `${SITE_URL}/chart/score` : undefined,
		}),
	}),
	component: ScoreRoute,
});

function ScoreRoute() {
	const { data } = useSuspenseQuery(restaurantQueries.scoreHistogram());
	if (!data) return <DefaultLoader text="Loading score histogram..." />;

	const scoreBins = [0, 13, 27, 45, 150];
	const scoreLabels = [
		"0-13 (A)",
		"14-27 (B)",
		"28-44 (C)",
		"45+ (C or worse)",
	];

	// Server shape: { data: Array<{ score, count }> }
	const histogram = Array.isArray(
		(data as unknown as Record<string, unknown>).data,
	)
		? (
				data as unknown as { data: Array<{ score: number; count: number }> }
			).data.map((d) => ({ name: String(d.score), count: d.count }))
		: (() => {
				const scores: number[] = [];
				const restaurants =
					(data as unknown as { restaurants?: Array<Restaurant> })
						?.restaurants ?? [];
				for (const r of restaurants) {
					const s = r.inspections?.[0]?.score as number | undefined;
					if (s !== undefined && s !== null && Number.isFinite(s))
						scores.push(s);
				}
				return scoreBins.slice(0, -1).map((bin, i) => {
					const nextBin = scoreBins[i + 1];
					return {
						name: scoreLabels[i],
						count: scores.filter((score) => score >= bin && score < nextBin)
							.length,
					};
				});
			})();

	return (
		<section className="">
			<h1 className="text-2xl font-bold mb-4">Score Histogram</h1>

			<Alert className="mb-6">
				<AlertTitle>What scores mean</AlertTitle>
				<AlertDescription>
					Inspection scores are totals of point values for sanitary violations;
					lower is better. Typical bins shown here map to letter grades (A/B/C):
					0–13 points = A, 14–27 = B, 28+ = C. The histogram aggregates the most
					recent inspection score for each restaurant. Some records may be
					missing scores or use special grade codes instead of a numeric score.
				</AlertDescription>
			</Alert>

			<ScoreBarChart data={histogram} />
		</section>
	);
}
