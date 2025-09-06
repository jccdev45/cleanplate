import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { CHART_CONFIG } from "@/lib/constants";
import { Cell, Pie, PieChart } from "recharts";

export function CriticalFlagPieChart({
	data,
}: { data: { name: string; value: number }[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Critical Flag Distribution</CardTitle>
			</CardHeader>
			<CardContent className="flex items-center justify-center">
				<ChartContainer config={CHART_CONFIG} className="h-[300px] w-full">
					<PieChart>
						<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
						<Pie
							data={data}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="50%"
							outerRadius={80}
							label
						>
							{data.map((entry) => (
								<Cell
									key={entry.name}
									fill={
										(
											CHART_CONFIG[entry.name as keyof typeof CHART_CONFIG] ||
											CHART_CONFIG.count
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
	);
}
