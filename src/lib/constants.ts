import type { ChartConfig } from "@/components/ui/chart";
import { MonitorIcon } from "lucide-react";

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
