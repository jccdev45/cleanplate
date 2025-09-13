import { DefaultLoader } from "@/components/default-loader";
import { MapFilters } from "@/components/map/map-filters";
import { RestaurantMap } from "@/components/map/restaurant-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { GRADES, restaurantSearchParamsSchema } from "@/schema/schema";
import { restaurantQueries } from "@/utils/restaurant";
import { useQuery } from "@tanstack/react-query";
import {
	ErrorComponent,
	type ErrorComponentProps,
	Link,
	createFileRoute,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/map")({
	loader: async ({ context }) => {
		// Prefetch the restaurant list data on the server
		await context.queryClient.prefetchQuery(
			restaurantQueries.list({ $limit: 1000 }),
		);
	},
	validateSearch: (search) => restaurantSearchParamsSchema.parse(search),
	ssr: "data-only",
	head: () => ({
		meta: [
			{ title: `Map | ${SITE_NAME}` },
			{
				name: "description",
				content:
					"Interactive map of NYC restaurant inspection results. Filter by grade, borough, and inspection date.",
			},
			{ property: "og:title", content: `Map | ${SITE_NAME}` },
			{
				property: "og:description",
				content:
					"Interactive map of NYC restaurant inspection results. Filter by grade, borough, and inspection date.",
			},
			{
				property: "og:image",
				content: SITE_URL
					? `${SITE_URL}/images/chinatown.jpg`
					: "/images/chinatown.jpg",
			},
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [
			...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/map` }] : []),
		],
	}),

	errorComponent: MapErrorComponent,
	component: MapPage,
});

function MapPage() {
	const searchParams = Route.useSearch();
	const { data, isError, isFetching, isLoading } = useQuery(
		restaurantQueries.list({
			...searchParams,
		}),
	);

	if (isLoading) return <DefaultLoader text="Loading map data..." />;
	if (isError || !data) throw new Error("Failed to load map data");

	return (
		<div className="flex flex-col h-[calc(100vh-64px)]">
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
				<RestaurantMap restaurants={data?.restaurants || []} />
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
		if (searchParams?.$limit)
			filters.push({ label: "Limit", value: String(searchParams.$limit) });
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
