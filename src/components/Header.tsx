import { Link } from "@tanstack/react-router";
import { Disc, MapIcon, Sheet, Utensils } from "lucide-react";

function LogoIcon() {
	return (
		<div className="relative">
			<Disc className="absolute size-6 text-foreground/30 fill-foreground/20" />
			<Utensils className="size-6 text-foreground" />
		</div>
	);
}

export default function Header() {
	return (
		<header className="p-2 flex gap-2 bg-white text-black justify-between">
			<nav className="flex flex-row">
				<div className="px-2 font-bold">
					<Link
						to="/"
						className="space-x-2 flex items-center"
						activeProps={{
							className: "underline decoration-primary underline-offset-4",
						}}
					>
						<LogoIcon /> <span className="text-foreground">Cleanplate</span>
					</Link>
				</div>

				<div className="px-2 font-bold">
					<Link
						to="/map"
						className="flex items-center gap-1"
						activeProps={{
							className:
								"text-primary underline decoration-primary underline-offset-4",
						}}
					>
						<MapIcon /> Map
					</Link>
				</div>
				<div className="px-2 font-bold">
					<Link
						to="/table"
						className="flex items-center gap-1"
						activeProps={{
							className:
								"text-primary underline decoration-primary underline-offset-4",
						}}
					>
						<Sheet /> Table
					</Link>
				</div>
			</nav>
		</header>
	);
}
