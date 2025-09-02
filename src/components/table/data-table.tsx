import { Skeleton } from "@/components/ui/skeleton";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type FilterFn,
	type PaginationState,
	type Table,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isFetching?: boolean;
	globalFilter: string;
	onGlobalFilterChange: (value: string) => void;
	tableRef?: React.Ref<Table<TData>>;
	fuzzyFilter?: FilterFn<TData>;
	pagination: PaginationState;
	onPaginationChange: (
		updaterOrValue:
			| PaginationState
			| ((old: PaginationState) => PaginationState),
	) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isFetching,
	globalFilter,
	onGlobalFilterChange,
	tableRef,
	fuzzyFilter,
	pagination,
	onPaginationChange,
}: DataTableProps<TData, TValue>) {
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

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
		onPaginationChange: onPaginationChange,
		globalFilterFn: fuzzyFilter ? "fuzzy" : undefined,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	React.useImperativeHandle(tableRef, () => table, [table]);

	const parentRef = React.useRef<HTMLDivElement>(null);
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 48, // Adjust this to your row height
		overscan: 10,
	});

	return (
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
										<tr key={row.id} style={{ height: `${virtualRow.size}px` }}>
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
	);
}
