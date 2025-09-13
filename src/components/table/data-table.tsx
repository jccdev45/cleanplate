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
import {
	type ColumnDef,
	type ColumnFiltersState,
	type FilterFn,
	type PaginationState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
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
} from "lucide-react";
import React from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isFetching?: boolean;
	globalFilter: string;
	onGlobalFilterChange: (value: string) => void;
	fuzzyFilter?: FilterFn<TData>;
	totalCount: number;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isFetching,
	globalFilter,
	onGlobalFilterChange,
	fuzzyFilter,
	totalCount,
}: DataTableProps<TData, TValue>) {
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data,
		columns,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		filterFns: { fuzzy: fuzzyFilter as FilterFn<any> },
		state: {
			columnFilters,
			globalFilter,
			pagination,
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: onGlobalFilterChange,
		onPaginationChange: setPagination,
		globalFilterFn: fuzzyFilter ?? undefined,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
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
