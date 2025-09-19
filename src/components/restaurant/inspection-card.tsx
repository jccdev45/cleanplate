import { ViolationsList } from "@/components/restaurant/violations-list";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ViewInspection } from "@/utils/restaurant-view";
import type * as React from "react";

export function InspectionCard({
	insp,
	violationFilter,
}: {
	insp: ViewInspection;
	violationFilter?: string | null;
}) {
	return (
		<Card
			key={insp.inspectionId}
			className={cn(
				"transition-all duration-300 ease-in-out border-l-2 animate-in zoom-in-95 hover:shadow-lg border-left-fill rounded-none",
				insp.gradeBorderClass,
			)}
			style={
				{
					animationDelay: insp.animationDelay,
					"--left-fill": insp.leftFillColor,
				} as React.CSSProperties
			}
			aria-label={`Inspection on ${insp.inspection_date.slice(0, 10)}`}
		>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle className="text-base font-bold">
					{insp.inspection_date.slice(0, 10)}
				</CardTitle>
				<Badge
					variant={
						insp.grade === "A"
							? "success"
							: insp.grade === "B"
								? "secondary"
								: insp.grade === "C"
									? "destructive"
									: "outline"
					}
					className="text-xs px-2 py-1"
				>
					Grade: {insp.grade || "N/A"}
				</Badge>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-2">
					<Badge
						className={cn(
							"w-fit",
							insp.critical_flag === "Critical"
								? badgeVariants({ variant: "destructive" })
								: insp.critical_flag === "Not Critical"
									? badgeVariants({ variant: "secondary" })
									: badgeVariants({ variant: "outline" }),
						)}
					>
						{insp.critical_flag}
					</Badge>
					<div className="text-sm">
						<span className="font-medium">Score:</span> {insp.score ?? "N/A"}
					</div>
					{insp.action && (
						<div className="text-xs text-muted-foreground">
							<span className="font-medium">Action:</span> {insp.action}
						</div>
					)}

					{insp.violations && insp.violations.length > 0 && (
						<div>
							<span className="font-medium">Violations:</span>
							<ViolationsList
								violations={insp.violations}
								startOpen={Boolean(violationFilter && insp.matchesFilter)}
								inspectionId={insp.inspectionId}
							/>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export default InspectionCard;
