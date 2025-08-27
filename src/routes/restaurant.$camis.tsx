// TODO: Add filter controls for inspections (date sorting, grade filter)
// TODO: Add sticky header for restaurant info? Maybe

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { restaurantQueries } from "@/utils/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/restaurant/$camis")({
	component: RouteComponent,
	loader: ({ context: { queryClient }, params: { camis } }) => {
		return queryClient.ensureQueryData(restaurantQueries.detail(camis));
	},
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
		<main className="flex flex-col items-center px-4 py-6 max-w-2xl mx-auto animate-fade-in">
			<Card className="w-full mb-6 shadow-lg border-2 border-primary/20">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-primary mb-2 animate-slide-down">
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
							{restaurant.building} {restaurant.street}, {restaurant.zipcode}
						</span>
					</div>
					{restaurant.phone && (
						<div className="mb-2 text-sm">
							<span className="font-medium">Phone:</span> {restaurant.phone}
						</div>
					)}
					<div className="flex gap-4 mt-2">
						{restaurant.latitude && restaurant.longitude && (
							<a
								href={`https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 underline text-xs"
							>
								View on Map
							</a>
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
									"transition-all duration-500 ease-in-out border-l-4",
									insp.grade === "A"
										? "border-green-500 animate-pop"
										: insp.grade === "B"
											? "border-yellow-500 animate-pop"
											: "border-red-500 animate-pop",
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
										{insp.grade || "N/A"}
									</Badge>
								</CardHeader>
								<CardContent>
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
			<style>{`
				@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
				.animate-fade-in { animation: fade-in 0.7s ease; }
				@keyframes slide-down { from { transform: translateY(-20px); opacity: 0; } to { transform: none; opacity: 1; } }
				.animate-slide-down { animation: slide-down 0.5s cubic-bezier(.4,2,.3,1); }
				@keyframes pop { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
				.animate-pop { animation: pop 0.4s cubic-bezier(.4,2,.3,1); }
			`}</style>
		</main>
	);
}
