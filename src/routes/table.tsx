import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { SITE_NAME } from "@/lib/constants";
import { restaurantSearchParamsSchema } from "@/schema/schema";
import type { Restaurant } from "@/types/restaurant";
import { restaurantQueries } from "@/utils/restaurant";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { FilterFn } from "@tanstack/react-table";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/table")({
	component: TableRoute,
	validateSearch: (search) => restaurantSearchParamsSchema.parse(search),
	head: () => ({
		meta: [
			{ title: `Table | ${SITE_NAME}` },
			{
				name: "description",
				content:
					"Browse the full dataset of NYC restaurant inspections in a searchable table. Filter and export results.",
			},
			{ property: "og:title", content: `Table | ${SITE_NAME}` },
			{
				property: "og:description",
				content:
					"Browse the full dataset of NYC restaurant inspections in a searchable table. Filter and export results.",
			},
			{
				property: "og:image",
				content: SITE_URL
					? `${SITE_URL}/images/nathans.jpg`
					: "/images/nathans.jpg",
			},
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [
			...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/table` }] : []),
		],
	}),
});

const fuzzyFilter: FilterFn<Restaurant> = (row, columnId, value, addMeta) => {
	const itemRank = rankItem(row.getValue(columnId), value);
	addMeta({ itemRank });
	return itemRank.passed;
};

function TableRoute() {
	const searchParams = Route.useSearch();

	const [globalFilter, setGlobalFilter] = useState(searchParams?.$q || "");

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
