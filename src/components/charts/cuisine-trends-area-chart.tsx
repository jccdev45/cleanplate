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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function CuisineTrendsAreaChart({
	data,
	topCuisines,
}: { data: Record<string, string | number>[]; topCuisines: string[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Cuisine Popularity Trends Over Time</CardTitle>
				<CardDescription>
					Top 6 cuisines by restaurant count, shown by inspection year. Reveals
					how cuisine popularity shifts over time.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={CHART_CONFIG} className="h-[400px] w-full">
					<AreaChart
						data={data}
						margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="year" tickLine={false} axisLine={false} />
						<YAxis allowDecimals={false} />
						<ChartTooltip
							cursor={false}
							content={(props: CustomTooltipProps) => (
								<ChartTooltipContent {...props} hideIndicator hideLabel />
							)}
						/>
						<ChartLegend />
						{topCuisines.map((cuisine, idx) => (
							<Area
								key={cuisine}
								type="monotone"
								dataKey={cuisine}
								stroke={CHART_CONFIG.count.color}
								fillOpacity={0.2 + idx * 0.1}
								fill={CHART_CONFIG.count.color}
							/>
						))}
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
