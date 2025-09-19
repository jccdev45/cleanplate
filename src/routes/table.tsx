import { DefaultLoader } from "@/components/default-loader";
import { DismissibleAlert } from "@/components/dismissible-alert";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/data-table";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_NAME } from "@/lib/constants";
import { restaurantSearchParamsSchema } from "@/schema/schema";
import type { Restaurant } from "@/types/restaurant";
import { restaurantQueries } from "@/utils/restaurant";
import seo from "@/utils/seo";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
	ErrorComponent,
	type ErrorComponentProps,
	createFileRoute,
} from "@tanstack/react-router";
import type { FilterFn } from "@tanstack/react-table";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/table")({
	validateSearch: (search) => restaurantSearchParamsSchema.parse(search),
	loaderDeps: (params) => ({ params }),
	loader: async ({ context, deps }) => {
		const query = restaurantQueries.infiniteList({ ...deps.params.search });

		// Prefetch the restaurant list data on the server
		await context.queryClient.ensureInfiniteQueryData({
			...query,
		});
	},
	head: () => ({
		meta: seo({
			title: `Table | ${SITE_NAME}`,
			description:
				"Browse the full dataset of NYC restaurant inspections in a searchable table. Filter and export results.",
			image: SITE_URL
				? `${SITE_URL}/images/nathans.jpg`
				: "https://placehold.co/1200x630/0f172a/ffffff?font=roboto&text=Table",
			url: SITE_URL ? `${SITE_URL}/table` : undefined,
		}),
		links: [
			...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/table` }] : []),
		],
	}),
	errorComponent: TableErrorComponent,
	component: TableRoute,
});

const fuzzyFilter: FilterFn<Restaurant> = (row, columnId, value, addMeta) => {
	const itemRank = rankItem(row.getValue(columnId), value);
	addMeta({ itemRank });
	return itemRank.passed;
};

function TableRoute() {
	const searchParams = Route.useSearch();

	const [globalFilter, setGlobalFilter] = useState(searchParams?.$q || "");

	const { data, isLoading, isError, isFetching } = useSuspenseInfiniteQuery(
		restaurantQueries.infiniteList(searchParams),
	);

	if (isLoading) return <DefaultLoader text="Loading table data..." />;
	if (isError || !data) throw new Error("Failed to load table data");

	const pages = data.pages ?? [];
	const restaurants: Restaurant[] = pages.flatMap((p) => p.restaurants ?? []);
	const totalCount =
		pages[0]?.count ??
		pages.reduce((sum, p) => sum + (p.restaurants?.length ?? 0), 0);

	return (
		<div className="min-h-screen p-6 space-y-2">
			<DismissibleAlert title="Heads up!">
				Initial response times may be slow due to API restraints.
			</DismissibleAlert>
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

function TableErrorComponent({ error }: ErrorComponentProps) {
	return (
		<div className="min-h-screen p-6 space-y-4">
			<ErrorComponent error={error} />
			<Alert variant="destructive">
				<AlertCircleIcon />
				<div className="flex flex-col">
					<AlertTitle>Unable to load table</AlertTitle>
					<AlertDescription>
						We had trouble loading restaurant inspection data. You can try again
						or check your connection. If the problem persists, contact support.
					</AlertDescription>
					<div className="mt-3 flex flex-col items-center gap-2">
						{/* <Button type="button" size="sm" onClick={() => refetch()}>
							Retry
						</Button> */}
						<Accordion
							className="text-xs text-muted-foreground"
							type="single"
							collapsible
						>
							<AccordionItem value="technical-details">
								<Button variant="outline" asChild>
									<AccordionTrigger className="cursor-pointer">
										Technical Details
									</AccordionTrigger>
								</Button>
								<AccordionContent>
									<pre className="whitespace-pre-wrap mt-2 text-[12px]">
										{error instanceof Error
											? error.message
											: JSON.stringify(error, null, 2)}
									</pre>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</div>
			</Alert>
		</div>
	);
}
