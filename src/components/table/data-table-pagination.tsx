import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Table } from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import React from "react";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
	totalCount: number;
	pageIndex: number;
	pageSize: number;
}

export function DataTablePagination<TData>({
	table,
	totalCount,
	pageIndex,
	pageSize,
}: DataTablePaginationProps<TData>) {
	return (
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
					{pageIndex + 1} of {table.getPageCount()}
				</strong>
			</span>
			<span className="flex items-center gap-1">
				| Go to page:
				<GoToPageInput
					pageIndex={pageIndex}
					pageCount={table.getPageCount()}
					onGo={(page) => table.setPageIndex(page)}
				/>
			</span>
			<Select
				value={String(pageSize)}
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
