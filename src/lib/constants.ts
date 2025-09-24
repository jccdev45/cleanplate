import type { ChartConfig } from "@/components/ui/chart";
import {
	CalendarSync,
	MonitorIcon,
	ShieldCheck,
	TextSearch,
} from "lucide-react";

// Site-wide SEO defaults
export const SITE_NAME = "CleanPlate";
export const SITE_DEFAULT_DESCRIPTION =
	"Explore NYC restaurant inspection results, grades, and inspection history. Search by name, cuisine, or location.";
// Use the newly created OG image for the site-wide default (homepage)
export const SITE_DEFAULT_OG_IMAGE = "/og_image.png";

export const HERO_IMAGES = [
	{
		src: "/images/chinatown.jpg",
		type: "image",
		alt: "Chinatown in the daytime, in Chinatown, Manhattan. Numerous signs are advertising the various Chinese businesses in the area. Photo by Wes Hicks.",
	},
	{
		src: "/images/cosmic-diner.jpg",
		type: "image",
		alt: "Cosmic Diner at night in Manhattan. A man with an umbrella is walking towards the restaurant. Photo by Luiz Guimaraes.",
	},
	{
		src: "/images/dallas-bbq.jpg",
		type: "image",
		alt: "Dallas BBQ at night in Chelsea, Manhattan. Diners are seen inside eating and drinking. Photo by Nathalia Segato.",
	},
	{
		src: "/images/nathans.jpg",
		type: "image",
		alt: "Nathan's Famous in the daytime at Coney Island, Brooklyn. Photo by Paulo Silva.",
	},
	{
		src: "/images/sidewalk-dining.jpg",
		type: "image",
		alt: "Nighttime sidewalk dining in Manhattan, with a view of the Empire State Building in the background. Photo by Megan Bucknall.",
	},
	{
		src: "/images/silver-diner.jpg",
		type: "image",
		alt: "The Empire Diner at night in Chelsea, Manhattan, NYC. Photographed in January, a sidewalk vestibule is seen in front of the entrance to insulate diners from the cold winter air. Photo by Lee Ball.",
	},
];

export const TESTIMONIALS = [
	{
		imageInitial: "J",
		fallback: "JL",
		quote: `“${SITE_NAME} helped me find safe places to eat for my family. Super easy to use!”`,
		author: "Jamie L.",
	},
	{
		imageInitial: "A",
		fallback: "AP",
		quote: "“I love the up-to-date info. I check before every dinner out!”",
		author: "Alex P.",
	},
	{
		imageInitial: "P",
		fallback: "PS",
		quote: "“The design is beautiful and the data is trustworthy.”",
		author: "Priya S.",
	},
	{
		imageInitial: "M",
		fallback: "MB",
		quote: `“${SITE_NAME} is my go-to for finding safe dining options!”`,
		author: "Michael B.",
	},
];

export const CHART_CONFIG = {
	count: {
		label: "Restaurants",
		icon: MonitorIcon,
		color: "var(--chart-1)",
	},
	scores: {
		label: "Scores",
		color: "var(--chart-2)",
	},
	Critical: { label: "Critical", color: "var(--chart-1)" },
	"Not Critical": { label: "Not Critical", color: "var(--chart-2)" },
	"Not Applicable": {
		label: "Not Applicable",
		color: "var(--chart-3)",
	},
	A: { label: "Grade A", color: "var(--chart-1)" },
	B: { label: "Grade B", color: "var(--chart-2)" },
	C: { label: "Grade C", color: "var(--chart-3)" },
	P: { label: "Grade P", color: "var(--chart-4)" },
	Z: { label: "Grade Z", color: "var(--chart-5)" },
	"N/A": { label: "Not Graded", color: "var(--chart-6)" },
} satisfies ChartConfig;

export const FEATURE_ITEMS = [
	{
		icon: ShieldCheck,
		title: "Verified Data",
		description:
			"All inspection results are sourced directly from NYC Health Department.",
	},
	{
		icon: CalendarSync,
		title: "Up-to-Date",
		description:
			"We update our listings regularly so you always have the latest info.",
	},
	{
		icon: TextSearch,
		title: "Easy to Use",
		description:
			"Search, filter, and explore restaurants with a clean, modern interface.",
	},
];

// Compute a canonical SITE_URL used for building absolute URLs in meta tags.
// Prefer an explicit SITE_URL env var. As a fallback only use Vercel's
// VERCEL_URL when we're running in a production Vercel deployment
// (VERCEL_ENV === 'production'). This avoids accidentally exposing
// preview/deploy-preview domains as the canonical site URL.
const maybeVercel =
	process.env.VERCEL_ENV === "production" ? process.env.VERCEL_URL : "";
const rawSiteUrl = process.env.SITE_URL ?? maybeVercel ?? "";
export const SITE_URL = rawSiteUrl
	? rawSiteUrl.match(/^https?:\/\//)
		? rawSiteUrl.replace(/\/+$/, "")
		: `https://${rawSiteUrl.replace(/\/+$/, "")}`
	: "";
