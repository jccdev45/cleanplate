import { LimitFilter } from "@/components/filters/limit-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React from "react";

export type TableFilters = {
	boro?: string;
	grade?: string[];
	zipcode?: string;
	limit?: number;
};

export function TableFilterControls({
	filters,
	onFiltersChange,
	className,
}: {
	filters?: TableFilters;
	onFiltersChange?: (f: TableFilters) => void;
	className?: string;
}) {
	return (
		<TooltipProvider>
			<div className={cn("flex flex-wrap items-center gap-1", className)}>
				<div className="flex items-center gap-1">
					<Select
						value={filters?.grade?.length ? JSON.stringify(filters.grade) : ""}
						onValueChange={(v) => {
							if (!v) {
								onFiltersChange?.({
									boro: filters?.boro,
									grade: undefined,
									zipcode: filters?.zipcode,
								});
								return;
							}
							const parsed = JSON.parse(v) as string[];
							onFiltersChange?.({
								boro: filters?.boro,
								grade: parsed,
								zipcode: filters?.zipcode,
							});
						}}
					>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Filter grades" />
						</SelectTrigger>
						<SelectContent>
							{["A", "B", "C", "P", "Z", "N"].map((g) => (
								<Tooltip key={g}>
									<TooltipTrigger asChild>
										<SelectItem value={JSON.stringify([g])}>{g}</SelectItem>
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<div className="text-sm">
											{g === "A" && (
												<>
													<p className="font-medium">Grade A</p>
													<p>
														0 to 13 points for sanitary violations — indicates
														excellent compliance.
													</p>
												</>
											)}
											{g === "B" && (
												<>
													<p className="font-medium">Grade B</p>
													<p>
														14 to 27 points for sanitary violations — indicates
														satisfactory compliance.
													</p>
												</>
											)}
											{g === "C" && (
												<>
													<p className="font-medium">Grade C</p>
													<p>
														28 or more points for sanitary violations —
														indicates poor compliance.
													</p>
												</>
											)}
											{g === "Z" && (
												<>
													<p className="font-medium">Z — Grade Pending</p>
													<p>
														Inspection result is pending; final grade has not
														yet been issued.
													</p>
												</>
											)}
											{g === "P" && (
												<>
													<p className="font-medium">
														P — Pending (post-closure)
													</p>
													<p>
														Grade pending issued on re-opening following an
														initial inspection that resulted in a closure.
													</p>
												</>
											)}
											{g === "N" && (
												<>
													<p className="font-medium">N — Not Yet Graded</p>
													<p>
														Establishment has not yet received its first
														inspection and grade.
													</p>
												</>
											)}
										</div>
									</TooltipContent>
								</Tooltip>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="ghost"
						size="sm"
						aria-label="Clear grade filter"
						onClick={() =>
							onFiltersChange?.({
								boro: filters?.boro,
								grade: undefined,
								zipcode: filters?.zipcode,
							})
						}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
				<div className="flex items-center gap-1">
					<Select
						value={String(filters?.boro ?? "")}
						onValueChange={(v) =>
							onFiltersChange?.({
								boro: v || undefined,
								grade: filters?.grade,
								zipcode: filters?.zipcode,
							})
						}
					>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Filter borough" />
						</SelectTrigger>
						<SelectContent>
							{[
								"Manhattan",
								"Bronx",
								"Brooklyn",
								"Queens",
								"Staten Island",
							].map((b) => (
								<SelectItem key={b} value={b}>
									{b}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="ghost"
						size="sm"
						aria-label="Clear borough filter"
						onClick={() =>
							onFiltersChange?.({
								boro: undefined,
								grade: filters?.grade,
								zipcode: filters?.zipcode,
							})
						}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
				<div className="flex items-center gap-1">
					<ZipcodeControl filters={filters} onFiltersChange={onFiltersChange} />
				</div>
				<div className="flex items-center gap-1">
					<LimitFilter
						asLinks={false}
						value={filters?.limit ? String(filters.limit) : undefined}
						onChange={(v) =>
							onFiltersChange?.({
								boro: filters?.boro,
								grade: filters?.grade,
								zipcode: filters?.zipcode,
								limit: v,
							})
						}
					/>
				</div>
			</div>
		</TooltipProvider>
	);
}

function ZipcodeControl({
	filters,
	onFiltersChange,
}: {
	filters?: TableFilters;
	onFiltersChange?: (f: TableFilters) => void;
}) {
	const current = filters?.zipcode ?? "";
	const [value, setValue] = React.useState<string>(current ?? "");

	const apply = (val: string) => {
		const trimmed = val.trim();
		onFiltersChange?.({
			boro: filters?.boro,
			grade: filters?.grade,
			zipcode: trimmed || undefined,
		});
	};

	return (
		<div className="flex items-center gap-1">
			<Input
				placeholder="Zipcode"
				className="w-32"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={(e) => apply(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") apply((e.target as HTMLInputElement).value);
				}}
			/>
			<Button
				variant="ghost"
				size="sm"
				aria-label="Clear zipcode filter"
				onClick={() => {
					setValue("");
					onFiltersChange?.({
						boro: filters?.boro,
						grade: filters?.grade,
						zipcode: undefined,
					});
				}}
			>
				<X className="w-4 h-4" />
			</Button>
		</div>
	);
}

export default TableFilterControls;
