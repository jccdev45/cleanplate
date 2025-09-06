import { TopRestaurants } from "@/components/top-restaurants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { WorstRestaurants } from "@/components/worst-restaurants";
import { restaurantQueries } from "@/utils/restaurant";
import {
	ErrorComponent,
	type ErrorComponentProps,
	createFileRoute,
} from "@tanstack/react-router";
import { CalendarSync, ShieldCheck, TextSearch } from "lucide-react";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		const topRestaurants = await context.queryClient.ensureQueryData(
			restaurantQueries.list({
				grade: "A",
				$limit: 6,
				$order: "inspection_date DESC",
				$where: "grade = 'A'",
			}),
		);
		const worstRestaurants = await context.queryClient.ensureQueryData(
			restaurantQueries.list({
				$limit: 50,
				$order: "score DESC",
				$where: "score > 13 AND inspection_date > '2025-01-01'",
			}),
		);

		return {
			top: topRestaurants.restaurants,
			worst: worstRestaurants.restaurants,
		};
	},
	component: App,
	errorComponent: IndexErrorComponent,
	notFoundComponent: () => (
		<Alert>
			<AlertTitle>Not Found</AlertTitle>
			<AlertDescription>
				Something wasn't found, please try again
			</AlertDescription>
		</Alert>
	),
});

function IndexErrorComponent({ error }: ErrorComponentProps) {
	return <ErrorComponent error={error} />;
}

function App() {
	return (
		<main className="container max-w-5xl mx-auto py-12 px-4">
			{/* Hero Section */}
			<section className="flex flex-col items-center justify-center text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
				<h1
					className="text-5xl lg:text-6xl font-bold tracking-tight mb-4 font-serif"
					style={{ color: "var(--color-primary)" }}
				>
					Clean Plate
				</h1>
				<p className="text-xl text-muted-foreground mb-6 max-w-2xl">
					Discover NYC's best—and worst—restaurant health inspections. Eat
					smart, stay safe.
				</p>
			</section>

			{/* Features Grid */}
			<section className="mb-16">
				<h2 className="text-3xl font-semibold tracking-tight text-center mb-8 font-serif">
					Why Clean Plate?
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<Card className="p-6 flex flex-col items-center text-center shadow-md animate-in fade-in duration-700">
						<ShieldCheck className="mb-4 size-12 text-accent" />
						<h3 className="text-xl font-bold">Verified Data</h3>
						<p className="text-muted-foreground">
							All inspection results are sourced directly from NYC Health
							Department.
						</p>
					</Card>
					<Card className="p-6 flex flex-col items-center text-center shadow-md animate-in fade-in duration-700 delay-100">
						<CalendarSync className="mb-4 size-12 text-accent" />
						<h3 className="text-xl font-bold">Up-to-Date</h3>
						<p className="text-muted-foreground">
							We update our listings regularly so you always have the latest
							info.
						</p>
					</Card>
					<Card className="p-6 flex flex-col items-center text-center shadow-md animate-in fade-in duration-700 delay-200">
						<TextSearch className="mb-4 size-12 text-accent" />
						<h3 className="text-xl font-bold">Easy to Use</h3>
						<p className="text-muted-foreground">
							Search, filter, and explore restaurants with a clean, modern
							interface.
						</p>
					</Card>
				</div>
			</section>

			{/* Testimonials Carousel */}
			<section className="mb-16">
				<h2 className="text-3xl font-semibold tracking-tight text-center mb-8 font-serif">
					What People Are Saying
				</h2>
				<div className="max-w-2xl mx-auto">
					<Carousel>
						<CarouselContent>
							<CarouselItem>
								<Card className="p-6 flex flex-col items-center text-center">
									<Avatar>
										<AvatarImage src="https://placehold.co/100?text=J" />
										<AvatarFallback>JL</AvatarFallback>
									</Avatar>
									<p className="italic mb-2">
										“Clean Plate helped me find safe places to eat for my
										family. Super easy to use!”
									</p>
									<span className="font-semibold">— Jamie L.</span>
								</Card>
							</CarouselItem>
							<CarouselItem>
								<Card className="p-6 flex flex-col items-center text-center">
									<Avatar>
										<AvatarImage src="https://placehold.co/100?text=A" />
										<AvatarFallback>AP</AvatarFallback>
									</Avatar>
									<p className="italic mb-2">
										“I love the up-to-date info. I check before every dinner
										out!”
									</p>
									<span className="font-semibold">— Alex P.</span>
								</Card>
							</CarouselItem>
							<CarouselItem>
								<Card className="p-6 flex flex-col items-center text-center">
									<Avatar>
										<AvatarImage src="https://placehold.co/100?text=P" />
										<AvatarFallback>PS</AvatarFallback>
									</Avatar>
									<p className="italic mb-2">
										“The design is beautiful and the data is trustworthy.”
									</p>
									<span className="font-semibold">— Priya S.</span>
								</Card>
							</CarouselItem>
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</div>
			</section>

			{/* Top Restaurants Section */}
			<section className="mb-16 animate-in fade-in duration-700">
				<h2 className="text-2xl font-semibold tracking-tight font-serif mb-2">
					Top Rated Restaurants
				</h2>
				<p className="mb-4 text-sm text-muted-foreground">
					These restaurants have received a grade of A in their most recent
					inspection.
				</p>
				<TopRestaurants />
			</section>

			{/* Worst Restaurants Section */}
			<section className="animate-in fade-in duration-700">
				<h2 className="text-2xl font-semibold tracking-tight font-serif mb-2">
					Restaurants to Watch (Out For)
				</h2>
				<p className="mb-4 text-sm text-muted-foreground">
					These restaurants have received a grade of C or worse in their most
					recent inspection.
				</p>
				<WorstRestaurants />
			</section>

			{/* Footer */}
			<footer className="mt-16 py-8 text-center text-muted-foreground border-t border-border animate-in fade-in duration-700">
				<span className="font-mono">
					© {new Date().getFullYear()} Clean Plate NYC
				</span>
			</footer>
		</main>
	);
}
