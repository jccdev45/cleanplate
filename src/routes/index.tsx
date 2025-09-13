import {
	Hero,
	HeroCTA,
	HeroContent,
	HeroMedia,
	HeroOverlay,
	HeroSubtitle,
	HeroTitle,
} from "@/components/hero";
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
import { useIsMobile } from "@/hooks/use-mobile";
import {
	HERO_IMAGES,
	SITE_DEFAULT_DESCRIPTION,
	TESTIMONIALS,
} from "@/lib/constants";
import { restaurantQueries } from "@/utils/restaurant";
import seo from "@/utils/seo";
import {
	ErrorComponent,
	type ErrorComponentProps,
	createFileRoute,
} from "@tanstack/react-router";
import { CalendarSync, MapIcon, ShieldCheck, TextSearch } from "lucide-react";
const SITE_URL = process.env.SITE_URL ?? "";

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
	head: () => ({
		meta: [
			...seo({
				title: "Explore NYC restaurant inspections",
				description: SITE_DEFAULT_DESCRIPTION,
				image: SITE_URL
					? `${SITE_URL}/images/sidewalk-dining.jpg`
					: "/images/sidewalk-dining.jpg",
				url: SITE_URL ? `${SITE_URL}/` : undefined,
			}),
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/` }] : [])],
	}),
});

function IndexErrorComponent({ error }: ErrorComponentProps) {
	return <ErrorComponent error={error} />;
}

function App() {
	const isMobile = useIsMobile();

	return (
		<main className="container max-w-5xl mx-auto py-12 px-4">
			{/* Hero Section */}
			<Hero className="mb-16">
				<HeroMedia images={HERO_IMAGES} />
				<HeroOverlay />
				<HeroContent>
					<HeroTitle>CLEANPLATE</HeroTitle>
					<HeroSubtitle>
						Explore NYC restaurant health grades and inspections.
					</HeroSubtitle>
					<HeroCTA to="/map">
						<MapIcon className="size-6" /> View the map
					</HeroCTA>
				</HeroContent>
			</Hero>

			{/* Features Grid */}
			<section className="mb-16">
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

			{/* NOTE: Might just remove this entirely? */}
			{/* Testimonials Carousel */}
			<section className="mb-16">
				<h2 className="text-3xl font-semibold tracking-tight text-center mb-8 font-serif">
					What People Are Saying
				</h2>
				<div className="max-w-2xl mx-auto py-4">
					<Carousel orientation={isMobile ? "vertical" : "horizontal"}>
						<CarouselContent>
							{TESTIMONIALS.map((testimonial) => (
								<CarouselItem
									key={testimonial.author}
									className="basis-full sm:basis-1/2"
								>
									<Card className="p-6 flex flex-col items-center text-center">
										<Avatar>
											<AvatarImage
												src={`https://placehold.co/100?text=${testimonial.imageInitial}`}
											/>
											<AvatarFallback>{testimonial.fallback}</AvatarFallback>
										</Avatar>
										<p className="italic mb-2">{testimonial.quote}</p>
										<span className="font-semibold">{testimonial.author}</span>
									</Card>
								</CarouselItem>
							))}
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
		</main>
	);
}
