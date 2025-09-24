import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CircleQuestionMarkIcon } from "lucide-react";

export const LIMIT_OPTIONS: { label: string; limit: number }[] = [
	{ label: "Low", limit: 1000 },
	{ label: "Medium", limit: 5000 },
	{ label: "High", limit: 10000 },
];

type Props = {
	value?: string;
	/** If true, render Links that navigate to `/map` (map usage). If false, use onChange callback. */
	asLinks?: boolean;
	onChange?: (limit: number) => void;
	className?: string;
};

export function LimitFilter({
	value,
	asLinks = true,
	onChange,
	className,
}: Props) {
	// If asLinks is true we render Link-wrapped radio items pointing to /map
	if (asLinks) {
		return (
			<div className={className}>
				<div className="flex items-center gap-2 mb-2">
					<Label className="font-semibold">Density:</Label>
					<Tooltip>
						<TooltipTrigger>
							<CircleQuestionMarkIcon className="size-4" />
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-balance">
								Density controls how many restaurants are requested for the map.
								Lower density shows fewer markers and improves performance;
								higher density increases coverage but may slow loading.
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
				<RadioGroup
					defaultValue={value || String(LIMIT_OPTIONS[0].limit)}
					className="flex gap-2"
				>
					{LIMIT_OPTIONS.map(({ label, limit }) => (
						<div className="flex items-center gap-1" key={limit}>
							<Link
								className="flex items-center space-x-2"
								to="/map"
								search={(prev) => ({ ...prev, $limit: limit })}
							>
								<RadioGroupItem
									value={limit.toString()}
									id={`${label}-${limit}`}
								/>
							</Link>
							<Label htmlFor={`${label}-${limit}`}>{label}</Label>
						</div>
					))}
				</RadioGroup>
			</div>
		);
	}

	// Controlled mode: invoke onChange when value changes
	return (
		<div className={cn(className, "flex items-center gap-2")}>
			<Label className="font-semibold">Limit:</Label>
			<RadioGroup
				value={value ?? String(LIMIT_OPTIONS[0].limit)}
				onValueChange={(v) => onChange?.(Number(v))}
				className="flex gap-2"
			>
				{LIMIT_OPTIONS.map(({ label, limit }) => (
					<div className="flex items-center gap-1" key={limit}>
						<RadioGroupItem value={limit.toString()} id={`${label}-${limit}`} />
						<Label htmlFor={`${label}-${limit}`}>{label}</Label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
}
