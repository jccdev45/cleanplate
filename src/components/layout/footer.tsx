import { SITE_NAME } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { CopyrightIcon, ExternalLink, Github } from "lucide-react";

const LINKS = [
	{ href: "/", label: "Home" },
	{ href: "/map", label: "Map" },
	{ href: "/table", label: "Table" },
	{ href: "/chart", label: "Chart" },
];

export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-16 py-8 border-t border-border animate-in fade-in duration-700">
			<div className="container max-w-5xl mx-auto px-4">
				<div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
					<div className="text-center md:text-left">
						<div className="font-mono font-semibold">{SITE_NAME}</div>
						<div className="text-sm text-muted-foreground">
							Explore NYC restaurant inspections with confidence.
						</div>
					</div>

					<nav className="flex items-center gap-4">
						{LINKS.map(({ href, label }) => (
							<Link
								key={href}
								to={href}
								className="text-sm text-muted-foreground hover:underline"
							>
								{label}
							</Link>
						))}
						<a
							className="text-sm text-muted-foreground hover:underline"
							href="https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/about_data"
							target="_blank"
							rel="noreferrer"
						>
							Data
							<ExternalLink className="inline-block ml-1 size-3" />
						</a>
						<a
							className="text-sm text-muted-foreground hover:underline flex items-center gap-2"
							href="https://github.com/jccdev45/cleanplate"
							target="_blank"
							rel="noreferrer"
						>
							<Github className="size-4" />
							<span>GitHub</span>
						</a>
					</nav>
				</div>

				<div className="mt-6 text-center text-sm text-muted-foreground">
					<span>
						<CopyrightIcon className="inline-flex size-4" /> {year} {SITE_NAME}
					</span>{" "}
					<p>Built with public NYC inspection data.</p>
				</div>
			</div>
		</footer>
	);
}
