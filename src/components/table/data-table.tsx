import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsFetching } from "@tanstack/react-query";
import {
	type ColumnDef,
	type PaginationState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	X,
} from "lucide-react";
import React from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	// server-driven filters (parent controls via URL)
	filters?: { boro?: string; grade?: string[]; zipcode?: string };
	onFiltersChange?: (filters: {
		boro?: string;
		grade?: string[];
		zipcode?: string | undefined;
	}) => void;
	totalCount: number;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	// isFetching,
	totalCount,
	filters,
	onFiltersChange,
}: DataTableProps<TData, TValue>) {
	const isFetching = useIsFetching();
	// All filtering is handled server-side via `filters` + `onFiltersChange`.
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const table = useReactTable({
		data,
		columns,
		state: {
			pagination,
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const parentRef = React.useRef<HTMLDivElement>(null);
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 48, // Adjust this to your row height
		overscan: 10,
	});

	return (
		<>
			{/* Filter toolbar: Grade, Borough, Zipcode */}
			<div className="mb-4 flex gap-2 items-center">
				{/* Grade multi-select with clear button */}
				<div className="flex items-center gap-1">
					<Select
						value={JSON.stringify(filters?.grade ?? [])}
						onValueChange={(v) => {
							const parsed = JSON.parse(v || "[]") as string[];
							onFiltersChange?.({
								boro: filters?.boro,
								grade: parsed,
								zipcode: filters?.zipcode,
							});
						}}
					>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Filter grades (A,B,C)" />
						</SelectTrigger>
						<SelectContent>
							{["A", "B", "C"].map((g) => (
								<SelectItem key={g} value={JSON.stringify([g])}>
									{g}
								</SelectItem>
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
								grade: [],
								zipcode: filters?.zipcode,
							})
						}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>

				{/* Borough single select with clear button */}
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

				{/* Zipcode free input with clear button */}
				<div className="flex items-center gap-1">
					{/* Controlled zipcode input that updates server filters */}
					<ZipcodeControl filters={filters} onFiltersChange={onFiltersChange} />
				</div>
			</div>
			<div className="overflow-x-auto rounded-lg border">
				<div
					ref={parentRef}
					style={{ height: "600px", overflow: "auto" }}
					className="w-full"
				>
					<table
						className="w-full text-sm"
						style={{ tableLayout: "fixed", width: "100%" }}
					>
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											colSpan={header.colSpan}
											className={
												header.column.getIsPinned()
													? "sticky left-0 bg-white"
													: ""
											}
											style={{
												width: header.getSize(),
												textAlign: "left",
												padding: "0.75rem 1rem",
											}}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody style={{ position: "relative" }}>
							{isFetching ? (
								<>
									{Array.from({ length: 15 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: <skeleton loaders>
										<tr key={i}>
											<td colSpan={columns.length} className="p-2">
												<Skeleton className="w-full h-8" />
											</td>
										</tr>
									))}
								</>
							) : (
								<>
									{/* Top spacer */}
									{rowVirtualizer.getVirtualItems().length > 0 && (
										<tr
											style={{
												height: `${rowVirtualizer.getVirtualItems()[0].start}px`,
											}}
										/>
									)}
									{rowVirtualizer.getVirtualItems().map((virtualRow) => {
										const row = rows[virtualRow.index];
										return (
											<tr
												key={row.id}
												style={{ height: `${virtualRow.size}px` }}
											>
												{row.getVisibleCells().map((cell) => (
													<td
														key={cell.id}
														className={
															cell.column.getIsPinned()
																? "sticky left-0 bg-white"
																: ""
														}
														style={{ padding: "0.75rem 1rem" }}
													>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)}
													</td>
												))}
											</tr>
										);
									})}
									{/* Bottom spacer */}
									{rowVirtualizer.getVirtualItems().length > 0 && (
										<tr
											style={{
												height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}px`,
											}}
										/>
									)}
								</>
							)}
						</tbody>
					</table>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-2 mt-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronsLeft className="w-4 h-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRight className="w-4 h-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					<ChevronsRight className="w-4 h-4" />
				</Button>
				<span className="flex items-center gap-1">
					<div>Page</div>
					<strong>
						{pagination.pageIndex + 1} of {table.getPageCount()}
					</strong>
				</span>
				<span className="flex items-center gap-1">
					| Go to page:
					<GoToPageInput
						pageIndex={pagination.pageIndex}
						pageCount={table.getPageCount()}
						onGo={(page) => table.setPageIndex(page)}
					/>
				</span>
				<Select
					value={String(pagination.pageSize)}
					onValueChange={(v) => table.setPageSize(Number(v))}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Rows per page" />
					</SelectTrigger>
					<SelectContent>
						{[10, 20, 30, 50, 100, 200, 500, 1000].map((size) => (
							<SelectItem key={size} value={String(size)}>
								Show {size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<div className="flex items-center gap-1">
					Displaying
					<strong>{table.getRowModel().rows.length}</strong>
					of
					<strong>{totalCount}</strong>
					Results
				</div>
			</div>
		</>
	);
}

function GoToPageInput({
	pageIndex,
	pageCount,
	onGo,
}: { pageIndex: number; pageCount: number; onGo: (page: number) => void }) {
	const [inputValue, setInputValue] = React.useState(pageIndex + 1);
	React.useEffect(() => {
		setInputValue(pageIndex + 1);
	}, [pageIndex]);

	const handleSubmit = () => {
		if (
			inputValue > 0 &&
			inputValue <= pageCount &&
			inputValue - 1 !== pageIndex
		) {
			onGo(inputValue - 1);
		}
	};

	return (
		<Input
			type="number"
			min={1}
			max={pageCount}
			value={inputValue}
			onChange={(e) => {
				const val = Number(e.target.value);
				setInputValue(val);
			}}
			onBlur={handleSubmit}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					handleSubmit();
				}
			}}
			className="w-16"
		/>
	);
}

function ZipcodeControl({
	filters,
	onFiltersChange,
}: {
	filters?: { boro?: string; grade?: string[]; zipcode?: string };
	onFiltersChange?: (filters: {
		boro?: string;
		grade?: string[];
		zipcode?: string | undefined;
	}) => void;
}) {
	const current = filters?.zipcode ?? "";
	const [value, setValue] = React.useState<string>(current ?? "");

	React.useEffect(() => {
		setValue(current ?? "");
	}, [current]);

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
