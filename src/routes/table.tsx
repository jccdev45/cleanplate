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
import { restaurantSearchParamsSchema } from "@/schema/schema";
import type { Restaurant } from "@/types/restaurant";
import { restaurantQueries } from "@/utils/restaurant";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import type {
	ColumnDef,
	ColumnFiltersState,
	FilterFn,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";

export const Route = createFileRoute("/table")({
	component: TableRoute,
	validateSearch: (search) => restaurantSearchParamsSchema.parse(search),
});

function TableRoute() {
	const searchParams = useSearch({ from: "/table" });
	const navigate = useNavigate({ from: "/table" });

	const pageSize = Number(searchParams.$limit ?? 50); // default to 50 for perf
	const pageIndex = Number(searchParams.$offset ?? 0) / pageSize;

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [globalFilter, setGlobalFilter] = React.useState(
		searchParams?.$q || "",
	);

	const queryKey = React.useMemo(
		() => ["restaurants", searchParams],
		[searchParams],
	);
	const { data, error, isFetching } = useQuery({
		queryKey,
		queryFn: async (ctx) => {
			const queryObj = restaurantQueries.list(searchParams);
			if (typeof queryObj.queryFn === "function") {
				const result = await queryObj.queryFn(ctx);
				return result;
			}
			return { restaurants: [] };
		},
		staleTime: 60_000,
		refetchOnWindowFocus: false,
		refetchInterval: 120_000,
	});

	const restaurants: Restaurant[] = data?.restaurants ?? [];

	const columns = React.useMemo<ColumnDef<Restaurant, unknown>[]>(
		() => [
			{ accessorKey: "camis", header: "ID" },
			{ accessorKey: "dba", header: "Name" },
			{ accessorKey: "boro", header: "Borough" },
			{ accessorKey: "cuisine_description", header: "Cuisine" },
			{
				accessorKey: "grade",
				header: "Grade",
				accessorFn: (row) => row.inspections[0]?.grade,
				cell: ({ getValue }) => getValue() ?? "N/A",
			},
		],
		[],
	);

	const fuzzyFilter: FilterFn<Restaurant> = (row, columnId, value, addMeta) => {
		const itemRank = rankItem(row.getValue(columnId), value);
		addMeta({ itemRank });
		return itemRank.passed;
	};

	const table = useReactTable({
		data: restaurants,
		columns,
		filterFns: { fuzzy: fuzzyFilter },
		state: {
			columnFilters,
			globalFilter,
			pagination: { pageIndex, pageSize },
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: "fuzzy",
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		onPaginationChange: (updater) => {
			if (typeof updater === "function") {
				const newPagination = updater({ pageIndex, pageSize });
				handlePageChange(newPagination.pageIndex);
				handlePageSizeChange(newPagination.pageSize);
			}
		},
	});

	const parentRef = React.useRef<HTMLDivElement>(null);
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 48,
		overscan: 10,
	});

	const handlePageChange = React.useCallback(
		(newPage: number) => {
			// Guard: only navigate to valid page
			if (newPage < 0 || newPage >= table.getPageCount()) return;
			const offset = newPage * pageSize;
			navigate({ search: { ...searchParams, $offset: offset } });
		},
		[pageSize, navigate, searchParams, table],
	);

	const handlePageSizeChange = React.useCallback(
		(newSize: number) => {
			navigate({ search: { ...searchParams, $limit: newSize, $offset: 0 } });
		},
		[navigate, searchParams],
	);

	if (error) return <div>Error loading data.</div>;

	return (
		<div className="min-h-screen p-6 space-y-2">
			<Input
				value={globalFilter ?? ""}
				onChange={(e) => setGlobalFilter(e.target.value)}
				placeholder="Search all columns..."
				type="text"
				className="w-full"
			/>
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
											style={{
												width: header.getSize(),
												textAlign: "left",
												padding: "0.75rem 1rem",
											}}
										>
											{header.isPlaceholder ? null : (
												<>
													<div
														{...{
															className: header.column.getCanSort()
																? "cursor-pointer select-none"
																: "",
															onClick: header.column.getToggleSortingHandler(),
														}}
													>
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
														{{
															asc: " 🔼",
															desc: " 🔽",
														}[header.column.getIsSorted() as string] ?? null}
													</div>
													{header.column.getCanFilter() ? (
														<div className="mt-2">
															<Filter column={header.column} />
														</div>
													) : null}
												</>
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
													<td key={cell.id} style={{ padding: "0.75rem 1rem" }}>
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
					onClick={() => handlePageChange(0)}
					disabled={!table.getCanPreviousPage()}
				>
					{"<<"}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handlePageChange(pageIndex - 1)}
					disabled={!table.getCanPreviousPage()}
				>
					{"<"}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handlePageChange(pageIndex + 1)}
					disabled={!table.getCanNextPage()}
				>
					{">"}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handlePageChange(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					{">>"}
				</Button>
				<span className="flex items-center gap-1">
					<div>Page</div>
					<strong>
						{pageIndex + 1} of {table.getPageCount()}
					</strong>
				</span>
				<span className="flex items-center gap-1">
					| Go to page:
					<GoToPageInput
						pageIndex={pageIndex}
						pageCount={table.getPageCount()}
						onGo={handlePageChange}
					/>
				</span>
				<Select
					value={String(pageSize)}
					onValueChange={(v) => handlePageSizeChange(Number(v))}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Rows per page" />
					</SelectTrigger>
					<SelectContent>
						{[10, 20, 30, 50, 100, 200, 2000, 5000].map((size) => (
							<SelectItem key={size} value={String(size)}>
								Show {size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

function Filter({
	column,
}: {
	column: ColumnDef<Restaurant, unknown> & {
		getFilterValue: () => unknown;
		setFilterValue: (v: unknown) => void;
	};
}) {
	const columnFilterValue = column.getFilterValue();
	return (
		<Input
			type="text"
			value={(columnFilterValue ?? "") as string}
			onChange={(e) => column.setFilterValue(e.target.value)}
			placeholder="Search..."
			className="w-full"
		/>
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
