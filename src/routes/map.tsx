// TODO: Add cuisine filter (must figure out how to dynamically retrieve list of cuisines first)

import { DefaultLoader } from "@/components/default-loader";
import { DismissibleAlert } from "@/components/dismissible-alert";
import { MapFilters } from "@/components/map/map-filters";
import { RestaurantMap } from "@/components/map/restaurant-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import {
	GRADES,
	type RestaurantSearchParams,
	restaurantSearchParamsSchema,
} from "@/schema/schema";
import { normalizeParams } from "@/utils/normalize-params";
import { restaurantQueries } from "@/utils/restaurant";
import seo from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	ErrorComponent,
	type ErrorComponentProps,
	Link,
	createFileRoute,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/map")({
	validateSearch: (search) => restaurantSearchParamsSchema.parse(search),
	loaderDeps: (params) => ({ params }),
	loader: async ({ context, deps }) => {
		// Normalize search params: ensure we have a zoom and markerOnly default
		// so the server prefetch key matches what the client will request.
		const raw = (deps.params.search ?? {}) as Record<string, unknown>;
		const normalized = normalizeParams(raw);

		await context.queryClient.ensureQueryData(
			restaurantQueries.list(normalized as unknown as RestaurantSearchParams),
		);
	},
	ssr: "data-only",
	head: () => ({
		meta: seo({
			title: `Map | ${SITE_NAME}`,
			description:
				"Interactive map of NYC restaurant inspection results. Filter by grade, borough, and inspection date.",
			image: SITE_URL
				? `${SITE_URL}/images/chinatown.jpg`
				: "https://placehold.co/1200x630/0f172a/ffffff?font=roboto&text=Map",
			url: SITE_URL ? `${SITE_URL}/map` : undefined,
		}),
		links: [
			...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/map` }] : []),
		],
	}),

	errorComponent: MapErrorComponent,
	component: MapPage,
});

function MapPage() {
	const searchParams = Route.useSearch();
	const navigate = Route.useNavigate();

	// Memoize the normalized search params so the query key is stable
	// across renders. This prevents unnecessary refetches when the object
	// identity changes but the values are the same.
	const memoizedSearchParams = React.useMemo(() => {
		const raw = (searchParams ?? {}) as Record<string, unknown>;
		return normalizeParams(raw) as unknown as RestaurantSearchParams;
	}, [searchParams]);

	const listOptions = restaurantQueries.list(memoizedSearchParams);
	const { data, isError, isFetching, isLoading } = useSuspenseQuery({
		...listOptions,
	});

	// If there's no cached data at all, show the full loader. Otherwise keep
	// rendering the previous map while fetching new pages in the background.
	if (isLoading && !data) <DefaultLoader text="Loading map data..." />;
	if (isError || !data) throw new Error("Failed to load map data");

	return (
		<div className="flex flex-col h-[calc(100vh-64px)]">
			{/* Informational alert with quick action to increase density */}
			<div className="px-4">
				<DismissibleAlert
					title="Map density"
					action={
						<Button
							size="sm"
							variant="outline"
							onClick={() =>
								navigate({
									search: (prev) => ({ ...(prev || {}), $limit: 5000 }),
								})
							}
						>
							Increase density
						</Button>
					}
				>
					Showing a subset of results by default improves performance. Increase
					density to see more markers.
				</DismissibleAlert>
			</div>
			<div className="flex items-center px-4">
				<MapFilters />
				<div className="flex flex-col flex-1 text-center p-2">
					<h1 className="text-xl font-bold mb-2">
						Displaying {data?.count ?? 0} results
					</h1>
					<AppliedFilters searchParams={searchParams} />
				</div>
			</div>
			<main className="flex-grow relative">
				{/* Refetching: Subtle indicator */}
				{isFetching && !isLoading && (
					<div className="absolute top-4 right-4 z-50 bg-white/80 p-2 rounded-full shadow-lg">
						<Loader2 className="size-6 animate-spin text-primary" />
					</div>
				)}
				<Suspense
					fallback={
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="p-2 bg-white/90 rounded shadow">Loading map…</div>
						</div>
					}
				>
					<RestaurantMap restaurants={data?.restaurants ?? []} />
				</Suspense>
			</main>
		</div>
	);

	// AppliedFilters component displays a summary of active filters
	function AppliedFilters({
		searchParams,
	}: { searchParams: Record<string, unknown> }) {
		const filters: Array<{ label: string; value: string; variant?: string }> =
			[];

		if (searchParams?.$q)
			filters.push({ label: "Search", value: String(searchParams.$q) });
		if (
			searchParams?.grade &&
			!GRADES.includes(searchParams.grade as (typeof GRADES)[number])
		) {
			filters.push({
				label: "Grade",
				value: "Invalid",
				variant: "destructive",
			});
		} else if (searchParams?.grade) {
			filters.push({ label: "Grade", value: String(searchParams.grade) });
		}
		if (searchParams?.$limit) {
			const limitNum = Number(searchParams.$limit);
			let densityLabel = String(searchParams.$limit);
			if (limitNum === 1000) densityLabel = "Low";
			else if (limitNum === 5000) densityLabel = "Medium";
			else if (limitNum === 10000) densityLabel = "High";

			filters.push({ label: "Density", value: densityLabel });
		}
		if (searchParams?.boro)
			filters.push({ label: "Borough", value: String(searchParams.boro) });
		if (searchParams?.$order) {
			const orderValue = String(searchParams.$order);
			const readableOrder =
				orderValue === "inspection_date DESC"
					? "Newest"
					: orderValue === "inspection_date ASC"
						? "Oldest"
						: orderValue;
			filters.push({
				label: "Sort by",
				value: readableOrder,
			});
		}
		if (searchParams?.critical_flag) {
			filters.push({
				label: "Critical Flag",
				value: String(searchParams.critical_flag),
			});
		}

		if (filters.length === 0) {
			return (
				<span className="text-muted-foreground text-sm">
					No filters applied
				</span>
			);
		}

		return (
			<div className="flex flex-wrap gap-2 justify-center text-sm">
				{filters.map((filt) => (
					<Badge
						key={filt.label}
						variant={
							filt.variant
								? (filt.variant as
										| "default"
										| "secondary"
										| "destructive"
										| "outline")
								: "default"
						}
					>
						{filt.label}: <span>{filt.value}</span>
					</Badge>
				))}
			</div>
		);
	}
}

function MapErrorComponent({ error }: ErrorComponentProps) {
	return (
		<div className="min-h-screen p-6 space-y-4">
			<ErrorComponent error={error} />
			<div className="mt-3 flex flex-col items-center gap-2">
				<p className="text-muted-foreground">
					We had trouble loading the map. You can try again or check your
					connection. If the problem persists, contact support.
				</p>
				<Button asChild variant="link">
					<Link to="/map">Try Again</Link>
				</Button>
			</div>
		</div>
	);
}
