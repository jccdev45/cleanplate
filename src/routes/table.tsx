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
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
	ErrorComponent,
	type ErrorComponentProps,
	createFileRoute,
} from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/table")({
	validateSearch: (search) => restaurantSearchParamsSchema.parse(search),
	loaderDeps: (params) => ({ params }),
	loader: async ({ context, deps }) => {
		const query = restaurantQueries.infiniteList({ ...deps.params.search });

		try {
			await context.queryClient.ensureInfiniteQueryData({
				...query,
			});
		} catch (err) {
			console.error("Prefetch failed for /table loader", err);
			return { remoteDown: true };
		}
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

function TableRoute() {
	const searchParams = Route.useSearch();
	const navigate = Route.useNavigate();

	// Local query state mirrors the route $q value but we debounce updates
	const [query, setQuery] = useState(searchParams?.$q || "");
	// Local filter state mirrors route search params so we can control DataTable
	const [boro, setBoro] = useState<string | undefined>(
		searchParams?.boro ?? undefined,
	);
	const [grade, setGrade] = useState<string | undefined>(
		searchParams?.grade ?? undefined,
	);
	const [zipcode, setZipcode] = useState<string | undefined>(
		searchParams?.zipcode ? String(searchParams.zipcode) : undefined,
	);

	// Debounce navigation: when query changes, update route search after a delay
	useEffect(() => {
		const handler = setTimeout(() => {
			// set $q to undefined when empty to avoid adding empty param
			navigate({
				search: (prev) => ({ ...(prev || {}), $q: query || undefined }),
			});
		}, 350);
		return () => clearTimeout(handler);
	}, [query, navigate]);

	// Sync boro/grade/zipcode to the URL (debounced)
	useEffect(() => {
		const handler = setTimeout(() => {
			navigate({
				search: (prev) => ({
					...(prev || {}),
					boro: boro || undefined,
					grade: grade || undefined,
					zipcode: zipcode ? Number(zipcode) : undefined,
				}),
			});
		}, 350);
		return () => clearTimeout(handler);
	}, [boro, grade, zipcode, navigate]);

	const { data, isLoading, isError } = useSuspenseInfiniteQuery(
		restaurantQueries.infiniteList(searchParams),
	);

	if (isLoading) return <DefaultLoader text="Loading table data..." />;

	const remoteDown = isError || !data;

	const pages = data.pages ?? [];
	const restaurants: Restaurant[] = pages.flatMap((p) => p.restaurants ?? []);
	const totalCount =
		pages[0]?.count ??
		pages.reduce((sum, p) => sum + (p.restaurants?.length ?? 0), 0);

	return (
		<div className="min-h-screen p-6 space-y-2">
			{remoteDown ? (
				<DismissibleAlert title="Data temporarily unavailable">
					The restaurant data is temporarily unavailable. We're working on it —
					try again later.
				</DismissibleAlert>
			) : null}
			<DismissibleAlert title="Heads up!">
				Initial response times may be slow due to API restraints.
			</DismissibleAlert>
			<Input
				value={query ?? ""}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search (server-side) — restaurants, zipcode, borough..."
				type="text"
				className="w-full"
			/>

			<DataTable
				columns={columns}
				data={restaurants}
				totalCount={totalCount}
				filters={{ boro, grade: grade ? grade.split(",") : undefined, zipcode }}
				onFiltersChange={(next) => {
					setBoro(next.boro ?? undefined);
					setGrade(next.grade ? next.grade.join(",") : undefined);
					setZipcode(next.zipcode ?? undefined);
				}}
			/>
		</div>
	);
}

function TableErrorComponent({ error }: ErrorComponentProps) {
	const isDev = Boolean(import.meta.env?.DEV);

	return (
		<div className="min-h-screen p-6 space-y-4">
			{isDev ? <ErrorComponent error={error} /> : null}
			<Alert variant="destructive">
				<AlertCircleIcon />
				<div className="flex flex-col">
					<AlertTitle>Unable to load table</AlertTitle>
					<AlertDescription>
						We had trouble loading restaurant inspection data. You can try again
						or check your connection. If the problem persists, contact support.
					</AlertDescription>
					{isDev ? (
						<div className="mt-3 flex flex-col items-center gap-2">
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
					) : null}
				</div>
			</Alert>
		</div>
	);
}
