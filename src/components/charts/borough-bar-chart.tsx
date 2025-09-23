import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type CustomTooltipProps,
} from "@/components/ui/chart";
import { CHART_CONFIG } from "@/lib/constants";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function BoroughBarChart({
	data,
}: { data: { boro: string; count: number }[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Restaurants by Borough</CardTitle>
				<CardDescription>
					A breakdown of restaurants per borough.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={CHART_CONFIG}
					className="min-h-[150px] w-full mx-auto"
				>
					<BarChart
						layout="vertical"
						accessibilityLayer
						data={data}
						barCategoryGap="12%"
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
						<ChartTooltip
							cursor={false}
							content={(props: CustomTooltipProps) => (
								<ChartTooltipContent {...props} hideIndicator hideLabel />
							)}
						/>
						<Bar dataKey="count" fill={"var(--chart-5)"} radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
