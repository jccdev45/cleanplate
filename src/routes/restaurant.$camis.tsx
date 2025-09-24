import { InspectionCard } from "@/components/restaurant/inspection-card";
import { GenericErrorComponent } from "@/components/shared/generic-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_DEFAULT_DESCRIPTION } from "@/lib/constants";
import { restaurantQueries } from "@/queries/restaurant";
import type { Restaurant } from "@/types/restaurant";
import {
	VIOLATION_KEYWORDS,
	type ViewInspection,
	computeStats,
	filterInspections,
	formatPhone,
	gradeVariant,
	mapInspectionView,
} from "@/utils/restaurant-view";
import { seo } from "@/utils/seo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLinkIcon, MapPinnedIcon, XCircleIcon } from "lucide-react";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/restaurant/$camis")({
	component: RouteComponent,
	loader: ({ context: { queryClient }, params: { camis } }) => {
		return queryClient.ensureQueryData(restaurantQueries.detail(camis));
	},
	errorComponent: (props) => (
		<GenericErrorComponent {...props} title="restaurant" />
	),
	head: ({ loaderData, params }) => {
		const d = loaderData?.restaurants?.[0];
		const title = d ? `${d.dba}` : "Restaurant";
		const description = d
			? `${d.dba} in ${d.boro}. Latest grade: ${d.inspections?.[0]?.grade ?? "N/A"}. View inspection history and violations.`
			: SITE_DEFAULT_DESCRIPTION;
		const url = SITE_URL ? `${SITE_URL}/restaurant/${params.camis}` : undefined;

		const placeholder = `https://placehold.co/1200x630/0f172a/ffffff?font=roboto&text=${d?.dba?.[0] ?? "R"}`;
		// Use a plain restaurant detail screenshot for restaurant pages
		const image = SITE_URL ? `${SITE_URL}/restaurant-detail.png` : placeholder;

		return {
			meta: seo({ title, description, image, url }),
			links: [...(url ? [{ rel: "canonical", href: url }] : [])],
		};
	},
	validateSearch: (search) => search,
});

function RouteComponent() {
	const { camis } = Route.useParams();
	const {
		data: { restaurants },
	} = useSuspenseQuery(restaurantQueries.detail(camis));
	const navigate = useNavigate({ from: Route.fullPath });
	const search = Route.useSearch();

	const setViolationFilter = (filter: string | null) => {
		navigate({
			search: (prev) => ({ ...prev, violationFilter: filter || undefined }),
			replace: true,
		});
	};

	const violationFilter = (search as { violationFilter?: string })
		.violationFilter;

	const restaurant = restaurants?.[0] as Restaurant | undefined;
	if (!restaurant) {
		return <Skeleton className="h-32 w-full" />;
	}
	const filteredInspections = filterInspections(
		restaurant.inspections,
		violationFilter,
	);
	const { closureCount, avgScore } = computeStats(restaurant.inspections);
	const inspectionsForView = mapInspectionView(
		filteredInspections,
		violationFilter,
	) as ViewInspection[];

	return (
		<main className="px-4 py-6 max-w-6xl mx-auto animate-in fade-in-0 duration-700">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-1 min-w-0">
					<Card className="w-full mb-6 shadow-lg border border-primary/20 py-4 md:py-6 md:sticky md:top-6 md:max-h-[calc(100vh-4rem)] md:overflow-auto">
						<CardHeader className="flex flex-col lg:flex-row items-center lg:items-start sticky top-0 z-10 border-b px-4 md:px-6">
							<Avatar className="mx-auto lg:mx-0 mb-3 lg:mb-0 size-12 sm:size-14 md:size-16">
								<AvatarImage
									src={`https://placehold.co/100?text=${restaurant.dba[0]}`}
								/>
								<AvatarFallback>
									<span className="text-2xl font-bold">
										{restaurant.dba[0]}
									</span>
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 text-center lg:text-left">
								<CardTitle className="text-lg font-bold text-primary mb-1 animate-in slide-in-from-top-5 duration-500 ease-[cubic-bezier(.4,2,.3,1)]">
									{restaurant.dba}
								</CardTitle>
								<CardDescription className="flex flex-wrap gap-2 items-center px-0 md:px-0">
									<Badge variant="secondary">
										{restaurant.cuisine_description}
									</Badge>
									<Badge>{restaurant.boro}</Badge>
								</CardDescription>
							</div>
							{restaurant.latitude && restaurant.longitude && (
								<Button asChild variant="outline" size="sm">
									<Link
										to="/map"
										target="_blank"
										aria-label={`View ${restaurant.dba} on map`}
										search={{
											latitude: Number(restaurant.latitude),
											longitude: Number(restaurant.longitude),
											camis: restaurant.camis,
											zoom: 15,
										}}
									>
										<MapPinnedIcon className="size-5 mr-2" />
										Map
										<ExternalLinkIcon className="size-3 ml-auto" />
									</Link>
								</Button>
							)}
						</CardHeader>
						<CardContent>
							<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 text-balance">
								{/* Address & Contact */}
								<div className="flex-1 min-w-0">
									<div className="text-sm text-muted-foreground mb-2">
										<div className="font-semibold text-primary">Address:</div>
										<div className="font-medium">
											{restaurant.building} {restaurant.street},{" "}
											{restaurant.boro} {restaurant.zipcode}
										</div>
									</div>

									{restaurant.phone && (
										<div className="text-sm mb-2">
											<div className="font-semibold text-primary">Phone:</div>
											<div className="font-medium">
												{formatPhone(restaurant.phone)}
											</div>
										</div>
									)}

									<div className="text-sm">
										<div className="font-semibold text-primary">
											Total inspections:
										</div>
										<div className="font-medium">
											{restaurant.inspections.length}
										</div>
									</div>
								</div>

								{/* Key stats */}
								<div className="flex flex-col items-start lg:items-end">
									<div className="flex flex-col items-start lg:items-end text-left lg:text-right">
										<div className="text-sm">
											<div className="font-semibold text-primary">
												Most recent:
											</div>
											<div className="font-medium">
												{restaurant.inspections?.[0] ? (
													<>
														<span className="inline-block mr-2">
															<Badge
																variant={gradeVariant(
																	restaurant.inspections[0].grade,
																)}
																className="px-2"
															>
																{restaurant.inspections[0].grade ?? "N/A"}
															</Badge>
														</span>
														<span className="text-xs text-muted-foreground">
															{restaurant.inspections[0].inspection_date?.slice(
																0,
																10,
															)}
														</span>
													</>
												) : (
													<span className="text-sm font-medium">
														No inspections
													</span>
												)}
											</div>
										</div>

										{/* Average score */}
										<div className="text-sm mt-2">
											<div className="font-semibold text-primary">
												Avg score:
											</div>
											<div className="font-medium">{avgScore}</div>
										</div>

										{/* Times closed */}
										<div className="text-sm mt-2">
											<div className="font-semibold text-destructive">
												Times closed:
											</div>
											<div className="font-medium">{closureCount}</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="md:col-span-2">
					<section className="w-full space-y-2 px-2 md:px-0">
						<div className="sticky top-4">
							<h3 className="text-sm font-semibold">
								Filter Violations by Keyword
							</h3>
							<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-muted p-2 rounded">
								{VIOLATION_KEYWORDS.map((keyword) => (
									<Button
										key={keyword}
										variant={violationFilter === keyword ? "outline" : "ghost"}
										onClick={() =>
											setViolationFilter(
												violationFilter === keyword ? null : keyword,
											)
										}
										size="sm"
										className="capitalize relative"
									>
										{keyword}
										{violationFilter === keyword && (
											<XCircleIcon
												className="absolute -top-1 -right-1 size-4 fill-white text-destructive"
												onClick={() => setViolationFilter(null)}
											/>
										)}
									</Button>
								))}
							</div>
						</div>
						<h2 className="font-semibold mb-4">
							Inspection History ({filteredInspections.length} of{" "}
							{restaurant.inspections.length} results)
						</h2>
						<Separator className="" />
						<div className="flex flex-col gap-4">
							{inspectionsForView.length === 0 ? (
								<Alert>
									<AlertTitle>No matching inspections found.</AlertTitle>
									<AlertDescription>
										Try a different filter or clear the selection to see all
										inspections.
									</AlertDescription>
								</Alert>
							) : restaurant.inspections.length === 0 ? (
								<Alert>
									<AlertTitle>No inspections found.</AlertTitle>
									<AlertDescription>
										This restaurant has not been inspected yet or records are
										unavailable.
									</AlertDescription>
								</Alert>
							) : (
								inspectionsForView.map((insp: ViewInspection) => (
									<InspectionCard
										key={insp.inspectionId}
										insp={insp}
										violationFilter={violationFilter}
									/>
								))
							)}
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}
