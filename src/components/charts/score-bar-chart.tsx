import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type CustomTooltipProps,
} from "@/components/ui/chart";
import { CHART_CONFIG } from "@/lib/constants";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function ScoreBarChart({
	data,
}: { data: { name: string; count: number }[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Score Distribution</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={CHART_CONFIG}
					className="min-h-[150px] md:min-h-[200px] lg:min-h-[300px] w-full"
				>
					<BarChart data={data} barCategoryGap="20%">
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="name"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<YAxis />
						<ChartTooltip
							cursor={false}
							content={(props: CustomTooltipProps) => (
								<ChartTooltipContent {...props} hideIndicator hideLabel />
							)}
						/>
						<Bar dataKey="count" fill={CHART_CONFIG.scores.color} radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
