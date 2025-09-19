import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
export type Violation = {
	violation_code: string;
	violation_description: string;
};

export function ViolationsList({
	violations,
	startOpen,
	inspectionId,
}: {
	violations: Violation[];
	startOpen?: boolean;
	inspectionId: string | number;
}) {
	if (!violations || violations.length === 0) return null;
	return (
		<Collapsible defaultOpen={Boolean(startOpen)}>
			<div className="mt-1">
				<CollapsibleTrigger className="text-sm underline flex items-center gap-2">
					{`${violations.length} violation${violations.length > 1 ? "s" : ""}`}
					<ChevronsUpDown className="size-4" />
				</CollapsibleTrigger>

				{/* Always show the first violation outside the collapsible content */}
				<div className="mt-1">
					<ul className="list-disc ml-6 mt-1 text-xs">
						<li className="mb-1 break-words">
							<span className="font-semibold text-red-600">
								{violations[0].violation_code}
							</span>
							: {violations[0].violation_description}
						</li>
					</ul>
				</div>

				<CollapsibleContent>
					<div className="max-h-48 overflow-auto">
						<ul className="list-disc ml-6 mt-1 text-xs">
							{violations.slice(1).length === 0 ? (
								<li className="text-muted-foreground">
									No additional violations
								</li>
							) : (
								violations.slice(1).map((v) => (
									<li
										key={`${inspectionId}-${v.violation_code}`}
										className="mb-1 break-words"
									>
										<span className="font-semibold text-red-600">
											{v.violation_code}
										</span>
										: {v.violation_description}
									</li>
								))
							)}
						</ul>
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}
