import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
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
				<ChartContainer config={CHART_CONFIG} className="h-[300px] w-full">
					<BarChart data={data} barSize={40}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="name"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<YAxis />
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="count" fill={CHART_CONFIG.scores.color} radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
