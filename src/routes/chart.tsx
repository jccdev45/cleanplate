import { BoroughBarChart } from "@/components/charts/borough-bar-chart";
import { CriticalFlagPieChart } from "@/components/charts/critical-flag-pie-chart";
import { CuisineBarChart } from "@/components/charts/cuisine-bar-chart";
import { CuisineTrendsAreaChart } from "@/components/charts/cuisine-trends-area-chart";
import { GradePieChart } from "@/components/charts/grade-pie-chart";
import { ScoreBarChart } from "@/components/charts/score-bar-chart";
import { DefaultLoader } from "@/components/default-loader";
import { DismissibleAlert } from "@/components/dismissible-alert";
import { GenericErrorComponent } from "@/components/generic-error";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SITE_NAME } from "@/lib/constants";
import { restaurantQueries } from "@/utils/restaurant";
import seo from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	type ErrorComponentProps,
	createFileRoute,
} from "@tanstack/react-router";
import { XCircleIcon } from "lucide-react";
import React from "react";

const SITE_URL = process.env.SITE_URL ?? "";
const $limit = 10000;

export const Route = createFileRoute("/chart")({
	loader: async ({ context }) => {
		// Prefetch the restaurant list data on the server. If the API is down
		// (planned maintenance), swallow the error so the route can still render
		// the page shell and show a friendly message.
		// try {
		await context.queryClient.ensureQueryData(
			restaurantQueries.list({ $limit }),
		);
		// } catch (err) {
		// 	console.error("Prefetch failed for /chart loader", err);
		// 	return { remoteDown: true };
		// }
	},
	head: () => ({
		meta: seo({
			title: `Charts | ${SITE_NAME}`,
			description:
				"Visual dashboard for NYC restaurant inspection trends by borough, cuisine, and score.",
			image: SITE_URL
				? `${SITE_URL}/images/cosmic-diner.jpg`
				: "https://placehold.co/1200x630/0f172a/ffffff?font=roboto&text=Charts",
			url: SITE_URL ? `${SITE_URL}/chart` : undefined,
		}),
		links: [
			...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/chart` }] : []),
		],
	}),

	errorComponent: (props: ErrorComponentProps) => (
		<GenericErrorComponent {...props} title="charts" />
	),
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isLoading, isError } = useSuspenseQuery(
		restaurantQueries.list({ $limit }),
	);

	if (isLoading) return <DefaultLoader text="Loading chart data..." />;

	const remoteDown = isError || !data;

	const {
		cuisineChartData,
		areaChartData,
		boroughChartData,
		gradeChartData,
		criticalFlagChartData,
		scoreDistribution,
		totalRestaurants,
		totalCuisines,
		scoresLength,
		scoresSum,
		topCuisines,
	} = React.useMemo(() => {
		const cuisineCounts: Record<string, number> = {};
		const boroughCounts: Record<string, number> = {};
		const gradeCounts: Record<string, number> = {};
		const criticalFlagCounts: Record<string, number> = {};
		const scores: number[] = [];
		const cuisineTrends: Record<string, Record<string, number>> = {};

		for (const r of data.restaurants) {
			const cuisine = r.cuisine_description || "Other";
			cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;

			const boro = r.boro || "Other";
			boroughCounts[boro] = (boroughCounts[boro] || 0) + 1;

			const grade = r.inspections[0]?.grade || "N/A";
			gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;

			const criticalFlag = r.inspections[0]?.critical_flag || "Not Applicable";
			criticalFlagCounts[criticalFlag] =
				(criticalFlagCounts[criticalFlag] || 0) + 1;

			const score = r.inspections[0]?.score;
			if (score !== null && score !== undefined && Number.isFinite(score)) {
				scores.push(score);
			}

			const year = r.inspections[0]?.inspection_date?.slice(0, 4) || "Unknown";
			if (!cuisineTrends[cuisine]) cuisineTrends[cuisine] = {};
			cuisineTrends[cuisine][year] = (cuisineTrends[cuisine][year] || 0) + 1;
		}

		const cuisineChartData = Object.entries(cuisineCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 12)
			.map(([cuisine, count]) => ({ cuisine, count }));

		const topCuisines = Object.entries(cuisineCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)
			.map(([cuisine]) => cuisine);

		const allYears = Array.from(
			new Set(
				Object.values(cuisineTrends).flatMap((trend) => Object.keys(trend)),
			),
		).sort();

		const areaChartData = allYears.map((year) => {
			const entry: Record<string, number | string> = { year };
			for (const cuisine of topCuisines) {
				entry[cuisine] = cuisineTrends[cuisine]?.[year] || 0;
			}
			return entry;
		});

		const boroughChartData = Object.entries(boroughCounts)
			.sort((a, b) => b[1] - a[1])
			.map(([boro, count]) => ({ boro, count }));

		const gradeChartData = Object.entries(gradeCounts)
			.sort((a, b) => (a[0] < b[0] ? -1 : 1))
			.map(([grade, count]) => ({ grade, count }));

		const criticalFlagChartData = Object.entries(criticalFlagCounts)
			.sort((a, b) => b[1] - a[1])
			.map(([flag, count]) => ({ name: flag, value: count }));

		const scoreBins = [0, 13, 27, 45, 150];
		const scoreLabels = [
			"0-13 (A)",
			"14-27 (B)",
			"28-44 (C)",
			"45+ (C or worse)",
		];
		const scoreDistribution = scoreBins.slice(0, -1).map((bin, i) => {
			const nextBin = scoreBins[i + 1];
			return {
				name: scoreLabels[i],
				count: scores.filter((score) => score >= bin && score < nextBin).length,
			};
		});
		const totalRestaurants = data.restaurants.length;
		const totalCuisines = Object.keys(cuisineCounts).length;
		const scoresLength = scores.length;
		const scoresSum = scores.reduce((a, b) => a + b, 0);

		return {
			cuisineChartData,
			areaChartData,
			boroughChartData,
			gradeChartData,
			criticalFlagChartData,
			scoreDistribution,
			totalRestaurants,
			totalCuisines,
			scoresLength,
			scoresSum,
			topCuisines,
		};
	}, [data.restaurants]);

	// Summary cards
	const gradeACount = gradeChartData.find((g) => g.grade === "A")?.count || 0;
	const percentageGradeA =
		totalRestaurants > 0
			? ((gradeACount / totalRestaurants) * 100).toFixed(1)
			: 0;

	return (
		<main className="container mx-auto p-4 sm:p-6 lg:p-8">
			{remoteDown ? (
				<div className="mb-6">
					<DismissibleAlert
						title="Data temporarily unavailable"
						isActuallyDismissable={false}
						icon={<XCircleIcon className="w-6 h-6 text-destructive" />}
					>
						The restaurant data is temporarily unavailable. Please try again
						later.
					</DismissibleAlert>
				</div>
			) : null}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
					Restaurant Data Dashboard
				</h1>
				<p className="text-lg text-muted-foreground mt-2">
					An overview of restaurant inspections in NYC.
				</p>
			</div>

			{/* Summary Section */}
			<section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
				<Card>
					<CardHeader>
						<CardTitle>Avg Inspection Score</CardTitle>
						<CardDescription>Mean of latest inspection scores</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-primary">
							{scoresLength > 0 ? (scoresSum / scoresLength).toFixed(1) : "N/A"}
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							Based on {scoresLength.toLocaleString()} inspections
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Total Cuisines</CardTitle>
						<CardDescription>Unique cuisine types</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-primary">
							{totalCuisines}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Grade 'A' Restaurants</CardTitle>
						<CardDescription>
							Percentage of top-rated establishments
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-primary">
							{percentageGradeA}%
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Charts grid using extracted components */}
			<section className="mb-10">
				<Tabs defaultValue="cuisine" className="w-full">
					<TabsList className="flex items-center justify-start flex-wrap h-auto space-y-1">
						<TabsTrigger value="cuisine">Cuisine</TabsTrigger>
						<TabsTrigger value="trends">Trends</TabsTrigger>
						<TabsTrigger value="borough">Borough</TabsTrigger>
						<TabsTrigger value="grade">Grade</TabsTrigger>
						<TabsTrigger value="critical">Critical Flag</TabsTrigger>
						<TabsTrigger value="score">Score</TabsTrigger>
					</TabsList>
					<TabsContent value="cuisine" className="pt-6">
						<CuisineBarChart data={cuisineChartData} />
					</TabsContent>
					<TabsContent value="trends" className="pt-6">
						<CuisineTrendsAreaChart
							data={areaChartData}
							topCuisines={topCuisines}
						/>
					</TabsContent>
					<TabsContent value="borough" className="pt-6">
						<BoroughBarChart data={boroughChartData} />
					</TabsContent>
					<TabsContent value="grade" className="pt-6">
						<div className="flex justify-center">
							<GradePieChart data={gradeChartData} />
						</div>
					</TabsContent>
					<TabsContent value="critical" className="pt-6">
						<div className="flex justify-center">
							<CriticalFlagPieChart data={criticalFlagChartData} />
						</div>
					</TabsContent>
					<TabsContent value="score" className="pt-6">
						<ScoreBarChart data={scoreDistribution} />
					</TabsContent>
				</Tabs>
			</section>
		</main>
	);
}
