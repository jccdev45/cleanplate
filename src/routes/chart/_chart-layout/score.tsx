import { ScoreBarChart } from "@/components/charts/score-bar-chart";
import { DefaultLoader } from "@/components/layout/default-loader";
import { restaurantQueries } from "@/queries/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chart/_chart-layout/score")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			restaurantQueries.scoreHistogram({ $limit: 10000 }),
		);
	},
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

	const scores: number[] = [];
	for (const r of data.restaurants) {
		const s = r.inspections[0]?.score;
		if (s !== undefined && s !== null && Number.isFinite(s)) scores.push(s);
	}

	const histogram = scoreBins.slice(0, -1).map((bin, i) => {
		const nextBin = scoreBins[i + 1];
		return {
			name: scoreLabels[i],
			count: scores.filter((score) => score >= bin && score < nextBin).length,
		};
	});

	return (
		<section className="p-6">
			<h1 className="text-2xl font-bold mb-4">Score Histogram</h1>
			<ScoreBarChart data={histogram} />
		</section>
	);
}
