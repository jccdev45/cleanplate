import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import {
	SITE_DEFAULT_DESCRIPTION,
	SITE_DEFAULT_OG_IMAGE,
	SITE_NAME,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { restaurantQueries } from "@/utils/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLinkIcon, MapPinnedIcon, XCircleIcon } from "lucide-react";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/restaurant/$camis")({
	component: RouteComponent,
	loader: ({ context: { queryClient }, params: { camis } }) => {
		return queryClient.ensureQueryData(restaurantQueries.detail(camis));
	},
	head: ({ loaderData, params }) => {
		const d = loaderData?.restaurants?.[0];
		const title = d ? `${d.dba} | ${SITE_NAME}` : `Restaurant | ${SITE_NAME}`;
		const description = d
			? `${d.dba} in ${d.boro}. Latest grade: ${d.inspections?.[0]?.grade ?? "N/A"}. View inspection history and violations.`
			: SITE_DEFAULT_DESCRIPTION;
		const url = SITE_URL ? `${SITE_URL}/restaurant/${params.camis}` : undefined;
		const image = SITE_URL
			? `${SITE_URL}${SITE_DEFAULT_OG_IMAGE}`
			: SITE_DEFAULT_OG_IMAGE;

		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:image", content: image },
				{ property: "og:type", content: "website" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: image },
				...(url ? [{ property: "og:url", content: url }] : []),
			],
			links: [...(url ? [{ rel: "canonical", href: url }] : [])],
		};
	},
	validateSearch: (search) => search, // Allow any search params
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

	const restaurant = restaurants?.[0];
	if (!restaurant) {
		return <Skeleton className="h-32 w-full" />;
	}

	const violationKeywords = [
		"Pest",
		"Temperature",
		"Sanitation",
		"Hygiene",
		"Contamination",
		"Signage",
	];

	const filteredInspections = violationFilter
		? restaurant.inspections.filter((insp) =>
				insp.violations.some((v) =>
					v.violation_description
						.toLowerCase()
						.includes(violationFilter.toLowerCase()),
				),
			)
		: restaurant.inspections;

	return (
		<main className="flex flex-col items-center px-4 py-6 max-w-2xl mx-auto animate-in fade-in-0 duration-700">
			<Card className="w-full mb-6 shadow-lg border border-primary/20">
				<CardHeader className="flex flex-row items-center sticky top-0 z-10 border-b">
					<Avatar className="size-12 sm:size-14">
						<AvatarImage
							src={`https://placehold.co/100?text=${restaurant.dba[0]}`}
						/>
						<AvatarFallback>
							<span className="text-2xl font-bold">{restaurant.dba[0]}</span>
						</AvatarFallback>
					</Avatar>
					<div className="flex-1">
						<CardTitle className="text-lg sm:text-2xl font-bold text-primary mb-1 animate-in slide-in-from-top-5 duration-500 ease-[cubic-bezier(.4,2,.3,1)]">
							{restaurant.dba}
						</CardTitle>
						<CardDescription className="flex flex-wrap gap-2 items-center">
							<Badge variant="secondary">
								{restaurant.cuisine_description}
							</Badge>
							<Badge>{restaurant.boro}</Badge>
						</CardDescription>
					</div>
					<div>
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
					</div>
				</CardHeader>
				{(() => {
					const mostRecent = restaurant.inspections?.[0];
					const closureCount = restaurant.inspections.filter((i) =>
						i.action?.toLowerCase().includes("closed"),
					).length;
					const numericScores = restaurant.inspections
						.map((i) => Number(i.score))
						.filter((s) => !Number.isNaN(s));
					const avgScore = numericScores.length
						? (
								numericScores.reduce((a, b) => a + b, 0) / numericScores.length
							).toFixed(1)
						: "N/A";
					const gradeVariant = (g?: string) =>
						g === "A"
							? "success"
							: g === "B"
								? "secondary"
								: g === "C"
									? "destructive"
									: "outline";

					return (
						<CardContent>
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
								{/* Address & Contact */}
								<div className="flex-1 min-w-0">
									<div className="text-sm text-muted-foreground mb-1">
										<span className="font-semibold text-primary">Address:</span>{" "}
										<span className="font-medium">
											{restaurant.building} {restaurant.street},{" "}
											{restaurant.boro} {restaurant.zipcode}
										</span>
									</div>

									{restaurant.phone && (
										<div className="text-sm mb-1">
											<span className="font-semibold text-primary">Phone:</span>{" "}
											<span className="font-medium">
												{(() => {
													const p = restaurant.phone ?? "";
													const digits = p.replace(/\D/g, "");
													if (digits.length === 10) {
														return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
													}
													if (digits.length === 11 && digits.startsWith("1")) {
														return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
													}
													return p;
												})()}
											</span>
										</div>
									)}

									<div className="text-sm">
										<span className="font-semibold text-primary">
											Total inspections:
										</span>{" "}
										<span className="font-medium">
											{restaurant.inspections.length}
										</span>
									</div>
								</div>

								{/* Key stats */}
								<div className="flex flex-col sm:items-end gap-2">
									{/* Most recent grade */}
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold text-primary">
											Most recent:
										</span>
										{mostRecent ? (
											<>
												<Badge
													variant={gradeVariant(mostRecent.grade)}
													className="px-2"
												>
													{mostRecent.grade ?? "N/A"}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{mostRecent.inspection_date?.slice(0, 10)}
												</span>
											</>
										) : (
											<span className="text-sm font-medium">
												No inspections
											</span>
										)}
									</div>

									{/* Average score */}
									<div className="text-sm">
										<span className="font-semibold text-primary">
											Avg score:
										</span>{" "}
										<span className="font-medium">{avgScore}</span>
									</div>

									{/* Times closed */}
									<div className="text-sm">
										<span className="font-semibold text-destructive">
											Times closed:
										</span>{" "}
										<span className="font-medium">{closureCount}</span>
									</div>
								</div>
							</div>
						</CardContent>
					);
				})()}
			</Card>

			<section className="w-full space-y-2">
				<h3 className="text-sm font-semibold">Filter Violations by Keyword</h3>
				<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-muted p-2 rounded">
					{violationKeywords.map((keyword) => (
						<Button
							key={keyword}
							variant={violationFilter === keyword ? "outline" : "ghost"}
							onClick={() =>
								setViolationFilter(violationFilter === keyword ? null : keyword)
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
				<h2 className="font-semibold mb-4">
					Inspection History ({filteredInspections.length} of{" "}
					{restaurant.inspections.length} results)
				</h2>
				<Separator className="" />
				<div className="flex flex-col gap-4">
					{filteredInspections.length === 0 ? (
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
						filteredInspections.map((insp, idx) => (
							<Card
								key={insp.inspectionId}
								className={cn(
									"transition-all duration-500 ease-in-out border-l-4 animate-in zoom-in-95 hover:scale-105 hover:shadow-xl",
									{
										A: "border-green-500",
										B: "border-yellow-500",
										C: "border-red-500",
										P: "border-gray-400",
										Z: "border-gray-400",
										N: "border-gray-400",
									}[insp.grade ?? "N"] ?? "border-gray-400",
								)}
								style={{ animationDelay: `${idx * 80}ms` }}
								aria-label={`Inspection on ${insp.inspection_date.slice(0, 10)}`}
							>
								<CardHeader className="flex flex-row items-center justify-between gap-2">
									<CardTitle className="text-base font-bold">
										{insp.inspection_date.slice(0, 10)}
									</CardTitle>
									<Badge
										variant={
											insp.grade === "A"
												? "success"
												: insp.grade === "B"
													? "secondary"
													: insp.grade === "C"
														? "destructive"
														: "outline"
										}
										className="text-xs px-2 py-1"
									>
										Grade: {insp.grade || "N/A"}
									</Badge>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-2">
										<Badge
											className={cn(
												"w-fit",
												insp.critical_flag === "Critical"
													? badgeVariants({ variant: "destructive" })
													: insp.critical_flag === "Not Critical"
														? badgeVariants({ variant: "secondary" })
														: badgeVariants({ variant: "outline" }),
											)}
										>
											{insp.critical_flag}
										</Badge>
										<div className="text-sm">
											<span className="font-medium">Score:</span>{" "}
											{insp.score ?? "N/A"}
										</div>
										{insp.action && (
											<div className="text-xs text-muted-foreground">
												<span className="font-medium">Action:</span>{" "}
												{insp.action}
											</div>
										)}
										{insp.violations.length > 0 && (
											<div>
												<span className="font-medium">Violations:</span>
												<ul className="list-disc ml-6 mt-1 text-xs">
													{insp.violations.map((v) => (
														<li
															key={`${insp.inspectionId}-${v.violation_code}`}
															className="mb-1"
														>
															<span className="font-semibold text-red-600">
																{v.violation_code}
															</span>
															: {v.violation_description}
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						))
					)}
				</div>
			</section>
		</main>
	);
}
