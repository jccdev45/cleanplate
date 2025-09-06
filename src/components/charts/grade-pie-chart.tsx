import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { CHART_CONFIG } from "@/lib/constants";
import { Cell, Pie, PieChart } from "recharts";

export function GradePieChart({
	data,
}: { data: { grade: string; count: number }[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Grade Distribution</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={CHART_CONFIG}
					className="h-[300px] w-full flex items-center justify-center"
				>
					<PieChart>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Pie
							data={data}
							dataKey="count"
							nameKey="grade"
							cx="50%"
							cy="50%"
							outerRadius={80}
							label
						>
							{data.map((entry) => (
								<Cell
									key={entry.grade}
									fill={
										(
											CHART_CONFIG[entry.grade as keyof typeof CHART_CONFIG] ||
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
