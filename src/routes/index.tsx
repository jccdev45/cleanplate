import { DismissibleAlert } from "@/components/dismissible-alert";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { WorstRestaurants } from "@/components/worst-restaurants";
import {
	HERO_IMAGES,
	SITE_DEFAULT_DESCRIPTION,
	TESTIMONIALS,
} from "@/lib/constants";
import { FEATURE_ITEMS } from "@/lib/constants";
import { restaurantQueries } from "@/utils/restaurant";
import seo from "@/utils/seo";
import {
	ErrorComponent,
	type ErrorComponentProps,
	createFileRoute,
} from "@tanstack/react-router";
import { useLoaderData } from "@tanstack/react-router";
import { MapIcon, XCircleIcon } from "lucide-react";

const SITE_URL = process.env.SITE_URL ?? "";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		try {
			const [topRestaurants, worstRestaurants] = await Promise.all([
				context.queryClient.ensureQueryData(
					restaurantQueries.list({
						grade: "A",
						$limit: 6,
						$order: "inspection_date DESC",
						$where: "grade = 'A'",
					}),
				),
				context.queryClient.ensureQueryData(
					restaurantQueries.list({
						$limit: 50,
						$order: "score DESC",
						$where: "score > 13 AND inspection_date > '2025-01-01'",
					}),
				),
			]);

			return {
				top: topRestaurants.restaurants,
				worst: worstRestaurants.restaurants,
			};
		} catch (err) {
			console.error("Prefetch failed for / loader", err);
			return { remoteDown: true };
		}
	},
	head: () => ({
		meta: [
			...seo({
				title: "Explore NYC restaurant inspections",
				description: SITE_DEFAULT_DESCRIPTION,
				image: SITE_URL
					? `${SITE_URL}/images/sidewalk-dining.jpg`
					: "https://placehold.co/1200x630/0f172a/ffffff?font=roboto&text=CleanPlate",
				url: SITE_URL ? `${SITE_URL}/` : undefined,
			}),
		],
		links: [...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/` }] : [])],
	}),

	errorComponent: IndexErrorComponent,
	component: App,
});

function IndexErrorComponent({ error }: ErrorComponentProps) {
	const isDev = Boolean(import.meta.env?.DEV);

	if (isDev) return <ErrorComponent error={error} />;

	return (
		<main className="container max-w-3xl mx-auto py-12 px-4">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
				<p className="text-muted-foreground">
					We had trouble loading the page. You can try again or check your
					connection. If the problem persists, contact support.
				</p>
			</div>
		</main>
	);
}

function App() {
	const loaderData = useLoaderData({ from: "/" }) as
		| { remoteDown?: boolean }
		| undefined;

	return (
		<main className="container max-w-5xl mx-auto py-12 px-4">
			{loaderData?.remoteDown ? (
				<div className="mb-6">
					<DismissibleAlert
						title="Data temporarily unavailable"
						isActuallyDismissable={false}
						icon={<XCircleIcon className="size-5 text-destructive" />}
					>
						The restaurant data is temporarily unavailable. We're working on it
						— try again later.
					</DismissibleAlert>
				</div>
			) : null}
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

			{/* Small About Section (lighthearted) */}
			<section className="mb-12">
				<div className="prose max-w-3xl mx-auto text-center">
					<h2 className="text-2xl font-semibold">About Cleanplate</h2>
					<p className="text-balance">
						We make it easy to find restaurants with solid health grades in New
						York City — no guesswork, just the facts. Think of us as your
						friendly neighborhood inspector (minus the clipboard).
					</p>
				</div>
			</section>

			{/* Features Grid */}
			<section className="mb-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{FEATURE_ITEMS.map((it) => (
						<Card
							key={it.title}
							className="p-6 flex flex-col items-center text-center shadow-md animate-in fade-in duration-700"
						>
							{/* Icon component passed in constant */}
							<it.icon className="size-12 text-accent" />
							<h3 className="text-xl font-bold">{it.title}</h3>
							<p className="text-muted-foreground">{it.description}</p>
						</Card>
					))}
				</div>
			</section>

			{/* Testimonials (simple figure/blockquote panels) */}
			<section className="mb-16">
				<h2 className="text-3xl font-semibold tracking-tight text-center mb-8 font-serif">
					What People Are Saying
				</h2>
				<div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
					{TESTIMONIALS.map((testimonial) => (
						<figure
							key={testimonial.author}
							className="p-6 rounded-lg border bg-background/50"
						>
							<blockquote className="italic mb-4">
								{testimonial.quote}
							</blockquote>
							<figcaption className="flex items-center">
								<Avatar>
									<AvatarImage
										src={`https://placehold.co/100?text=${testimonial.imageInitial}`}
									/>
									<AvatarFallback>{testimonial.fallback}</AvatarFallback>
								</Avatar>
								<span className="ml-3 font-semibold">
									- {testimonial.author}
								</span>
							</figcaption>
						</figure>
					))}
				</div>
			</section>

			<TopRestaurants />

			<WorstRestaurants />

			{/* Final CTA / Credits Section */}
			<section className="mt-16 mb-24">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-2xl font-semibold mb-4">
						Want more data or want to help?
					</h2>
					<p className="mb-6 text-muted-foreground">
						This site uses publicly available NYC Health Department inspection
						data. Contributions, issues, or ideas are welcome on our GitHub.
					</p>
					<div className="flex items-center justify-center gap-4">
						<a
							href="https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/about_data"
							target="_blank"
							rel="noreferrer"
							className="underline"
						>
							NYC OpenData
						</a>
						<a
							href="https://github.com/jccdev45/cleanplate"
							target="_blank"
							rel="noreferrer"
							className="underline"
						>
							View on GitHub
						</a>
					</div>
				</div>
			</section>
		</main>
	);
}
