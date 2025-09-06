import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { restaurantQueries } from "@/utils/restaurant";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Monitor } from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";

const chartConfig = {
	count: {
		label: "Restaurants",
		icon: Monitor,
		color: "var(--chart-1)",
	},
	scores: {
		label: "Scores",
		color: "var(--chart-2)",
	},
	Critical: { label: "Critical", color: "var(--chart-1)" },
	"Not Critical": { label: "Not Critical", color: "var(--chart-2)" },
	"Not Applicable": {
		label: "Not Applicable",
		color: "var(--chart-3)",
	},
	A: { label: "Grade A", color: "var(--chart-1)" },
	B: { label: "Grade B", color: "var(--chart-2)" },
	C: { label: "Grade C", color: "var(--chart-3)" },
	P: { label: "Grade P", color: "var(--chart-4)" },
	Z: { label: "Grade Z", color: "var(--chart-5)" },
	"N/A": { label: "Not Graded", color: "var(--chart-6)" },
} satisfies ChartConfig;

export const Route = createFileRoute("/chart")({
	component: RouteComponent,
	ssr: "data-only",
});

function RouteComponent() {
	// Fetch restaurant data client-side
	const { data, isLoading, isError } = useQuery(
		restaurantQueries.list({ $limit: 5000 }),
	);

	if (isLoading) return <div className="p-8">Loading chart...</div>;
	if (isError || !data)
		return (
			<div className="p-8 text-red-600">Failed to load restaurant data.</div>
		);

	// ...existing data aggregation code...
	const cuisineCounts: Record<string, number> = {};
	const boroughCounts: Record<string, number> = {};
	const gradeCounts: Record<string, number> = {};
	const criticalFlagCounts: Record<string, number> = {};
	const scores: number[] = [];
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
		if (
			r.inspections[0]?.score !== null &&
			r.inspections[0]?.score !== undefined
		) {
			scores.push(r.inspections[0].score);
		}
	}
	const cuisineChartData = Object.entries(cuisineCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 12)
		.map(([cuisine, count]) => ({ cuisine, count }));
	// AreaChart data: show top 6 cuisines over time (by year)
	const cuisineTrends: Record<string, Record<string, number>> = {};
	for (const r of data.restaurants) {
		const cuisine = r.cuisine_description || "Other";
		const year = r.inspections[0]?.inspection_date?.slice(0, 4) || "Unknown";
		if (!cuisineTrends[cuisine]) cuisineTrends[cuisine] = {};
		cuisineTrends[cuisine][year] = (cuisineTrends[cuisine][year] || 0) + 1;
	}
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

	// Summary cards
	const totalRestaurants = data.restaurants.length;
	const totalCuisines = Object.keys(cuisineCounts).length;
	const totalBoroughs = Object.keys(boroughCounts).length;

	return (
		<main className="container mx-auto p-4 sm:p-6 lg:p-8">
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
						<CardTitle>Total Restaurants</CardTitle>
						<CardDescription>NYC database size</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-primary">
							{totalRestaurants.toLocaleString()}
						</div>
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
						<CardTitle>Total Boroughs</CardTitle>
						<CardDescription>NYC boroughs represented</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-primary">
							{totalBoroughs}
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Tabs for chart navigation */}
			<section className="mb-10">
				<div className="w-full max-w-4xl mx-auto">
					<div className="flex border-b border-border mb-4">
						{/* Simple tabs, could use shadcn/ui tabs if available */}
						{/* ...existing code... */}
					</div>
					<div>
						{/* Charts grid */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<Card>
								<CardHeader>
									<CardTitle>Top 12 Restaurant Cuisines</CardTitle>
									<CardDescription>
										Distribution of the most common restaurant types in NYC.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ChartContainer
										config={chartConfig}
										className="h-[400px] w-full"
									>
										<BarChart
											accessibilityLayer
											data={cuisineChartData}
											barSize={32}
										>
											<CartesianGrid vertical={false} />
											<XAxis
												dataKey="cuisine"
												tickLine={false}
												tickMargin={10}
												axisLine={false}
												tickFormatter={(value) =>
													value.length > 10 ? `${value.slice(0, 10)}…` : value
												}
											/>
											<YAxis />
											<ChartTooltip content={<ChartTooltipContent />} />
											<ChartLegend />
											<Bar
												dataKey="count"
												fill={chartConfig.count.color}
												radius={4}
											/>
										</BarChart>
									</ChartContainer>
								</CardContent>
							</Card>
							{/* Comprehensive AreaChart: Cuisine Trends Over Time */}
							<Card>
								<CardHeader>
									<CardTitle>Cuisine Popularity Trends Over Time</CardTitle>
									<CardDescription>
										Top 6 cuisines by restaurant count, shown by inspection
										year. Reveals how cuisine popularity shifts over time.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ChartContainer
										config={chartConfig}
										className="h-[400px] w-full"
									>
										<AreaChart
											data={areaChartData}
											margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="year" tickLine={false} axisLine={false} />
											<YAxis allowDecimals={false} />
											<ChartTooltip content={<ChartTooltipContent />} />
											<ChartLegend />
											{topCuisines.map((cuisine, idx) => (
												<Area
													key={cuisine}
													type="monotone"
													dataKey={cuisine}
													stroke={chartConfig.count.color}
													fillOpacity={0.2 + idx * 0.1}
													fill={chartConfig.count.color}
												/>
											))}
										</AreaChart>
									</ChartContainer>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Restaurants by Borough</CardTitle>
									<CardDescription>
										A breakdown of restaurants per borough.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ChartContainer
										config={chartConfig}
										className="h-[400px] w-full"
									>
										<BarChart
											layout="vertical"
											accessibilityLayer
											data={boroughChartData}
											barSize={32}
										>
											<CartesianGrid horizontal={false} />
											<XAxis type="number" domain={[0, "dataMax + 50"]} hide />
											<YAxis
												type="category"
												dataKey="boro"
												tickLine={false}
												axisLine={false}
												width={80}
											/>
											<ChartTooltip content={<ChartTooltipContent />} />
											<Bar dataKey="count" fill={"var(--chart-5)"} radius={4} />
										</BarChart>
									</ChartContainer>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Grade Distribution</CardTitle>
								</CardHeader>
								<CardContent>
									<ChartContainer
										config={chartConfig}
										className="h-[300px] w-full flex items-center justify-center"
									>
										<PieChart>
											<ChartTooltip content={<ChartTooltipContent />} />
											<Pie
												data={gradeChartData}
												dataKey="count"
												nameKey="grade"
												cx="50%"
												cy="50%"
												outerRadius={80}
												label
											>
												{gradeChartData.map((entry) => (
													<Cell
														key={entry.grade}
														fill={
															(
																chartConfig[
																	entry.grade as keyof typeof chartConfig
																] || chartConfig.count
															)?.color
														}
													/>
												))}
											</Pie>
											<ChartLegend />
										</PieChart>
									</ChartContainer>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Critical Flag Distribution</CardTitle>
								</CardHeader>
								<CardContent className="flex items-center justify-center">
									<ChartContainer
										config={chartConfig}
										className="h-[300px] w-full"
									>
										<PieChart>
											<ChartTooltip
												content={<ChartTooltipContent nameKey="name" />}
											/>
											<Pie
												data={criticalFlagChartData}
												dataKey="value"
												nameKey="name"
												cx="50%"
												cy="50%"
												outerRadius={80}
												label
											>
												{criticalFlagChartData.map((entry) => (
													<Cell
														key={entry.name}
														fill={
															(
																chartConfig[
																	entry.name as keyof typeof chartConfig
																] || chartConfig.count
															)?.color
														}
													/>
												))}
											</Pie>
											<ChartLegend />
										</PieChart>
									</ChartContainer>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Score Distribution</CardTitle>
								</CardHeader>
								<CardContent>
									<ChartContainer
										config={chartConfig}
										className="h-[300px] w-full"
									>
										<BarChart data={scoreDistribution} barSize={40}>
											<CartesianGrid vertical={false} />
											<XAxis
												dataKey="name"
												tickLine={false}
												tickMargin={10}
												axisLine={false}
											/>
											<YAxis />
											<ChartTooltip content={<ChartTooltipContent />} />
											<Bar
												dataKey="count"
												fill={chartConfig.scores.color}
												radius={4}
											/>
										</BarChart>
									</ChartContainer>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
