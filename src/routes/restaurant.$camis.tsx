// TODO: Add filter controls for inspections (date sorting, grade filter)
// TODO: Add sticky header for restaurant info? Maybe

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { restaurantQueries } from "@/utils/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { MapPinned } from "lucide-react";

export const Route = createFileRoute("/restaurant/$camis")({
	component: RouteComponent,
	loader: ({ context: { queryClient }, params: { camis } }) => {
		return queryClient.ensureQueryData(restaurantQueries.detail(camis));
	},
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: loaderData.restaurants[0].dba }] : undefined,
	}),
});

function RouteComponent() {
	const { camis } = Route.useParams();
	const {
		data: { restaurants },
	} = useSuspenseQuery(restaurantQueries.detail(camis));

	const restaurant = restaurants?.[0];
	if (!restaurant) {
		return <Skeleton className="h-32 w-full" />;
	}

	return (
		<main className="flex flex-col items-center px-4 py-6 max-w-2xl mx-auto animate-in fade-in-0 duration-700">
			<Card className="w-full mb-6 shadow-lg border-2 border-primary/20">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-primary mb-2 animate-in slide-in-from-top-5 duration-500 ease-[cubic-bezier(.4,2,.3,1)]">
						{restaurant.dba}
					</CardTitle>
					<div className="flex flex-wrap gap-2 items-center">
						<Badge variant="secondary">{restaurant.cuisine_description}</Badge>
						<Badge>{restaurant.boro}</Badge>
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
					<div className="flex gap-4 mt-2">
						{restaurant.latitude && restaurant.longitude && (
							<Button asChild>
								<Link
									to="/map"
									target="_blank"
									search={{
										latitude: Number(restaurant.latitude),
										longitude: Number(restaurant.longitude),
										camis: restaurant.camis,
										zoom: 15,
									}}
								>
									<MapPinned className="size-5" />
									View on Map
								</Link>
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			<section className="w-full">
				<h2 className="text-lg font-semibold mb-4">Inspection History</h2>
				<div className="flex flex-col gap-4">
					{restaurant.inspections.length === 0 ? (
						<div className="text-muted-foreground">No inspections found.</div>
					) : (
						restaurant.inspections.map((insp, idx) => (
							<Card
								key={insp.inspectionId}
								className={cn(
									"transition-all duration-500 ease-in-out border-l-4 animate-in zoom-in-95 duration-400 ease-[cubic-bezier(.4,2,.3,1)]",
									insp.grade === "A"
										? "border-green-500"
										: insp.grade === "B"
											? "border-yellow-500"
											: "border-red-500",
								)}
								style={{ animationDelay: `${idx * 80}ms` }}
							>
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle className="text-base font-bold">
										{insp.inspection_date.slice(0, 10)}
									</CardTitle>
									<Badge
										variant={
											insp.grade === "A"
												? "default"
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
									<Badge
										className={cn(
											"block",
											insp.critical_flag === "Critical"
												? badgeVariants({ variant: "destructive" })
												: insp.critical_flag === "Not Critical"
													? badgeVariants({ variant: "secondary" })
													: badgeVariants({ variant: "outline" }),
										)}
									>
										{insp.critical_flag}
									</Badge>
									<div className="mb-1 text-sm">
										<span className="font-medium">Score:</span>{" "}
										{insp.score ?? "N/A"}
									</div>
									{insp.action && (
										<div className="mt-2 text-xs text-muted-foreground">
											<span className="font-medium">Action:</span> {insp.action}
										</div>
									)}
									{insp.violations.length > 0 && (
										<div className="mt-2">
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
								</CardContent>
							</Card>
						))
					)}
				</div>
			</section>
		</main>
	);
}
