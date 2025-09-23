import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function StatsStrip({
	avgScore = "N/A",
	totalCuisines = 0,
	percentageGradeA = "0.0",
	totalRestaurants,
	percentageCritical,
	topCuisines = [],
}: {
	avgScore?: string | number | null;
	totalCuisines?: number | null;
	percentageGradeA?: string | number | null;
	totalRestaurants?: number | null;
	percentageCritical?: number | string | null;
	topCuisines?: Array<{ cuisine: string; count?: number }>;
}) {
	return (
		<div className="flex gap-4 items-center justify-center mb-6 flex-wrap">
			<Card className="w-40">
				<CardHeader>
					<CardTitle className="text-lg">Avg Score</CardTitle>
					<CardDescription className="text-xs">
						Mean latest inspection
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-semibold text-primary">{avgScore}</div>
				</CardContent>
			</Card>

			<Card className="w-40">
				<CardHeader>
					<CardTitle className="text-lg">Cuisines</CardTitle>
					<CardDescription className="text-xs">Unique types</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-semibold text-primary">
						{totalCuisines}
					</div>
				</CardContent>
			</Card>

			<Card className="w-40">
				<CardHeader>
					<CardTitle className="text-lg">Grade A</CardTitle>
					<CardDescription className="text-xs">% top-rated</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-semibold text-primary">
						{percentageGradeA}%
					</div>
				</CardContent>
			</Card>

			<Card className="w-40">
				<CardHeader>
					<CardTitle className="text-lg">Restaurants</CardTitle>
					<CardDescription className="text-xs">Total distinct</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-semibold text-primary">
						{totalRestaurants ?? "N/A"}
					</div>
				</CardContent>
			</Card>

			<Card className="w-40">
				<CardHeader>
					<CardTitle className="text-lg">Critical</CardTitle>
					<CardDescription className="text-xs">
						% with critical issues
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-semibold text-primary">
						{typeof percentageCritical === "number"
							? percentageCritical.toFixed(1)
							: String(percentageCritical ?? "0.0")}
						%
					</div>
				</CardContent>
			</Card>

			{/* Top cuisines compact list */}
			<div className="w-full max-w-2xl mt-4">
				<div className="text-sm text-muted-foreground mb-2">Top cuisines</div>
				<div className="grid grid-cols-2 gap-2">
					{topCuisines.map((t) => (
						<div key={t.cuisine} className="p-2 rounded border bg-card">
							<div className="text-xs text-muted-foreground">{t.cuisine}</div>
							<div className="text-lg font-medium">{t.count ?? "-"}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
