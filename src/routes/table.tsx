import { DefaultLoader } from "@/components/layout/default-loader";
import { DismissibleAlert } from "@/components/shared/dismissible-alert";
import { GenericErrorComponent } from "@/components/shared/generic-error";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/data-table";
import { Input } from "@/components/ui/input";
import { SITE_URL } from "@/lib/constants";
import { restaurantQueries } from "@/queries/restaurant";
import { restaurantSearchParamsSchema } from "@/schema/schema";
import type { Restaurant } from "@/types/restaurant";
import { seo } from "@/utils/seo";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { XCircleIcon } from "lucide-react";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

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
			title: "Table",
			description:
				"Browse the full dataset of NYC restaurant inspections in a searchable table. Filter and export results.",
			// Use the table screenshot for the table route
			image: SITE_URL
				? `${SITE_URL}/table.png`
				: "https://placehold.co/1200x630/0f172a/ffffff?font=roboto&text=Table",
			url: SITE_URL ? `${SITE_URL}/table` : undefined,
		}),
		links: [
			...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/table` }] : []),
		],
	}),
	errorComponent: (props: ErrorComponentProps) => (
		<GenericErrorComponent {...props} title="table" />
	),
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
	const [limit, setLimit] = useState<number | undefined>(
		searchParams?.$limit ? Number(searchParams.$limit) : undefined,
	);

	// Debounced navigation helpers (use useDebounceFn so we can avoid effects)
	const debouncedNavigateQuery = useDebounceCallback((q: string) => {
		navigate({ search: (prev) => ({ ...(prev || {}), $q: q || undefined }) });
	}, 350);

	const debouncedNavigateFilters = useDebounceCallback(
		(next: {
			boro?: string | undefined;
			grade?: string | undefined;
			zipcode?: string | undefined;
		}) => {
			navigate({
				search: (prev) => ({
					...(prev || {}),
					boro: next.boro || undefined,
					grade: next.grade || undefined,
					zipcode: next.zipcode ? Number(next.zipcode) : undefined,
				}),
			});
		},
		350,
	);

	const debouncedNavigateLimit = useDebounceCallback((val?: number) => {
		navigate({
			search: (prev) => ({ ...(prev || {}), $limit: val ?? undefined }),
		});
	}, 350);

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
				<DismissibleAlert
					title="Data temporarily unavailable"
					isActuallyDismissable={false}
					icon={<XCircleIcon className="size-5 text-destructive" />}
				>
					The restaurant data is temporarily unavailable. We're working on it —
					try again later.
				</DismissibleAlert>
			) : null}
			<DismissibleAlert title="Heads up!">
				Initial response times may be slow due to API restraints.
			</DismissibleAlert>
			<Input
				value={query ?? ""}
				onChange={(e) => {
					const v = e.target.value;
					setQuery(v);
					debouncedNavigateQuery(v);
				}}
				placeholder="Search restaurants, zipcode, borough..."
				type="text"
				className="w-full"
			/>

			<DataTable
				columns={columns}
				data={restaurants}
				totalCount={totalCount}
				filters={{
					boro,
					grade: grade ? grade.split(",") : undefined,
					zipcode,
					limit,
				}}
				onFiltersChange={(next) => {
					const nextBoro = next.boro ?? undefined;
					const nextGrade = next.grade ? next.grade.join(",") : undefined;
					const nextZip = next.zipcode ?? undefined;
					const nextLimit = next.limit ?? undefined;
					setBoro(nextBoro);
					setGrade(nextGrade);
					setZipcode(nextZip);
					setLimit(nextLimit);
					debouncedNavigateFilters({
						boro: nextBoro,
						grade: nextGrade,
						zipcode: nextZip,
					});
					debouncedNavigateLimit(nextLimit);
				}}
			/>
		</div>
	);
}
