import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { restaurantSearchParamsSchema } from "@/schema/schema";
import type { Restaurant } from "@/types/restaurant";
import { restaurantQueries } from "@/utils/restaurant";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { FilterFn } from "@tanstack/react-table";
import { AlertCircleIcon } from "lucide-react";
import React from "react";

export const Route = createFileRoute("/table")({
	component: TableRoute,
	validateSearch: (search) => restaurantSearchParamsSchema.parse(search),
	ssr: "data-only",
});

const fuzzyFilter: FilterFn<Restaurant> = (row, columnId, value, addMeta) => {
	const itemRank = rankItem(row.getValue(columnId), value);
	addMeta({ itemRank });
	return itemRank.passed;
};

function TableRoute() {
	const searchParams = Route.useSearch();

	const [globalFilter, setGlobalFilter] = React.useState(
		searchParams?.$q || "",
	);

	const { data, error, isFetching } = useSuspenseQuery(
		restaurantQueries.list({
			...searchParams,
			$limit: 5000,
		}),
	);

	const restaurants: Restaurant[] = data?.restaurants ?? [];
	const totalCount = data?.count ?? 0;

	if (error) return <div>Error loading data.</div>;

	return (
		<div className="min-h-screen p-6 space-y-2">
			<Alert>
				<AlertCircleIcon />
				<AlertTitle>Heads up!</AlertTitle>
				<AlertDescription>
					Initial response times may be slow due to API restraints.
				</AlertDescription>
			</Alert>
			<Input
				value={globalFilter ?? ""}
				onChange={(e) => setGlobalFilter(e.target.value)}
				placeholder="Search all columns..."
				type="text"
				className="w-full"
			/>
			<DataTable
				columns={columns}
				data={restaurants}
				isFetching={isFetching}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				fuzzyFilter={fuzzyFilter}
				totalCount={totalCount}
			/>
		</div>
	);
}
