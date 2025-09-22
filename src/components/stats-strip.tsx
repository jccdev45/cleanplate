// TODO: Fix this

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { FC } from "react";

export const StatsStrip: FC<{
	avgScore?: string | number | null;
	totalCuisines?: number | null;
	percentageGradeA?: string | number | null;
}> = ({ avgScore = "N/A", totalCuisines = 0, percentageGradeA = "0.0" }) => {
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
		</div>
	);
};

export default StatsStrip;
