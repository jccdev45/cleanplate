import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Restaurant } from "@/types/restaurant";
import { Link } from "@tanstack/react-router";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp, Info } from "lucide-react";

export const columns: ColumnDef<Restaurant>[] = [
	{
		accessorKey: "dba",
		header: ({ column }) => (
			<SortableHeader column={column}>Name</SortableHeader>
		),
		cell: ({ row, getValue }) => (
			<Link
				to="/restaurant/$camis"
				params={{ camis: row.original.camis }}
				className="font-semibold text-blue-600 hover:underline"
			>
				{getValue() as string}
			</Link>
		),
		enablePinning: true,
	},
	{
		accessorKey: "address",
		header: "Address",
		cell: ({ row }) =>
			`${row.original.building || ""} ${row.original.street || ""}`,
	},
	{
		accessorKey: "zipcode",
		header: ({ column }) => (
			<SortableHeader column={column}>Zipcode</SortableHeader>
		),
		size: 80,
		cell: ({ row }) => row.original.zipcode || "------",
	},
	{
		accessorKey: "boro",
		header: ({ column }) => (
			<SortableHeader column={column}>Borough</SortableHeader>
		),
		size: 100,
	},
	{
		accessorKey: "cuisine_description",
		header: ({ column }) => (
			<SortableHeader column={column}>Cuisine</SortableHeader>
		),
	},
	{
		id: "grade",
		accessorKey: undefined,
		header: ({ column }) => {
			const gradeExplanations = {
				A: "0 to 13 points for sanitary violations — indicates excellent compliance.",
				B: "14 to 27 points for sanitary violations — indicates satisfactory compliance.",
				C: "28 to 40 points for sanitary violations — indicates marginal compliance.",
				N: "Not Yet Graded - Establishment has not yet received its first inspection and grade.",
				P: "Grade Pending issued on re-opening",
				Z: "Grade Pending",
			};
			return (
				<div className="flex items-center gap-2">
					<SortableHeader column={column}>Grade</SortableHeader>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Info className="size-4 text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent>
								<ul className="list-disc pl-4">
									{Object.entries(gradeExplanations).map(([grade, desc]) => (
										<li key={grade}>{`${grade}: ${desc}`}</li>
									))}
								</ul>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			);
		},
		accessorFn: (row) => row.inspections[0]?.grade,
		cell: ({ getValue }) => getValue() ?? "--",
		size: 100,
	},
	{
		accessorKey: "violation_description",
		header: "Violation",
		accessorFn: (row) =>
			row.inspections[0]?.violations
				.map((v) => v.violation_description)
				.join(", "),
		cell: ({ row, getValue }) => {
			const value = getValue<string>();
			if (!value) return "N/A";
			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger className="truncate">
							{value.substring(0, 50)}...
						</TooltipTrigger>
						<TooltipContent className="max-w-sm whitespace-normal break-words">
							{value.length > 200 ? (
								<>
									{value.substring(0, 200)}...
									<Link
										to="/restaurant/$camis"
										params={{ camis: row.original.camis }}
										className="text-secondary hover:underline block ml-auto font-bold w-fit"
										preloadDelay={100}
									>
										See More
									</Link>
								</>
							) : (
								value
							)}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
	},
];

function SortableHeader({
	children,
	column,
}: {
	children: React.ReactNode;
	column: Column<Restaurant, unknown>;
}) {
	const sorted = column.getIsSorted();
	return (
		<Button
			onClick={() => column.toggleSorting(sorted === "asc")}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					column.toggleSorting(sorted === "asc");
				}
			}}
			variant="ghost"
			size="sm"
		>
			{children}
			{sorted === "desc" ? (
				<ChevronDown className="w-4 h-4" />
			) : sorted === "asc" ? (
				<ChevronUp className="w-4 h-4" />
			) : (
				<ArrowUpDown className="w-4 h-4 text-muted" />
			)}
		</Button>
	);
}
