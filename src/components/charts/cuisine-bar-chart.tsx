import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartTooltip,
	ChartTooltipContent,
	type CustomTooltipProps,
} from "@/components/ui/chart";
import { CHART_CONFIG } from "@/lib/constants";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function CuisineBarChart({
	data,
}: { data: { cuisine: string; count: number }[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Top 12 Restaurant Cuisines</CardTitle>
				<CardDescription>
					Distribution of the most common restaurant types in NYC.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={CHART_CONFIG} className="h-[400px] w-full">
					<BarChart accessibilityLayer data={data} barCategoryGap="16%">
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="cuisine"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value: string) =>
								value.length > 10 ? `${value.slice(0, 10)}…` : value
							}
						/>
						<YAxis />
						<ChartTooltip
							cursor={false}
							content={(props: CustomTooltipProps) => (
								<ChartTooltipContent {...props} hideIndicator hideLabel />
							)}
						/>
						<ChartLegend />
						<Bar dataKey="count" fill={CHART_CONFIG.count.color} radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
