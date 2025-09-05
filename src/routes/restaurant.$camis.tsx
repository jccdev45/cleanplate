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
import { cn } from "@/lib/utils";
import { restaurantQueries } from "@/utils/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { FunnelX, MapPinned } from "lucide-react";

export const Route = createFileRoute("/restaurant/$camis")({
	component: RouteComponent,
	loader: ({ context: { queryClient }, params: { camis } }) => {
		return queryClient.ensureQueryData(restaurantQueries.detail(camis));
	},
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: loaderData.restaurants[0].dba }] : undefined,
	}),
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
					<Avatar className="h-14 w-14">
						<AvatarImage
							src={`https://placehold.co/100?text=${restaurant.dba[0]}`}
						/>
						<AvatarFallback>
							<span className="text-2xl font-bold">{restaurant.dba[0]}</span>
						</AvatarFallback>
					</Avatar>
					<div className="flex-1">
						<CardTitle className="text-2xl font-bold text-primary mb-1 animate-in slide-in-from-top-5 duration-500 ease-[cubic-bezier(.4,2,.3,1)]">
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
							<Button asChild variant="outline">
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
									<MapPinned className="size-5 mr-2" />
									View on Map
								</Link>
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-2 text-sm text-muted-foreground">
						<span>
							{restaurant.building} {restaurant.street}, {restaurant.boro}{" "}
							{restaurant.zipcode}
						</span>
					</div>
					{restaurant.phone && (
						<div className="mb-2 text-sm">
							<span className="font-medium">Phone:</span> {restaurant.phone}
						</div>
					)}
				</CardContent>
			</Card>

			<section className="w-full space-y-2">
				<h3 className="text-sm font-semibold">Filter Violations</h3>
				<div className="flex flex-wrap gap-2">
					<Button
						onClick={() => setViolationFilter(null)}
						variant={violationFilter === null ? "default" : "ghost"}
						size="sm"
					>
						<FunnelX />
					</Button>
					{violationKeywords.map((keyword) => (
						<Button
							key={keyword}
							variant={violationFilter === keyword ? "default" : "outline"}
							onClick={() =>
								setViolationFilter(violationFilter === keyword ? null : keyword)
							}
							size="sm"
						>
							{keyword}
						</Button>
					))}
				</div>
				<h2 className="text-lg font-semibold mb-4">Inspection History</h2>
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
