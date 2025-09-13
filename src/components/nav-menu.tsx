import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import {
	ChartBarIcon,
	CopyrightIcon,
	Disc,
	MapIcon,
	Menu,
	Moon,
	SheetIcon,
	Sun,
	Utensils,
} from "lucide-react";
import * as React from "react";

function LogoIcon() {
	return (
		<div className="relative">
			<Disc className="absolute size-8 text-foreground/30 fill-foreground/20" />
			<Utensils className="size-8 text-foreground" />
		</div>
	);
}

export function NavMenu() {
	const LINKS = [
		{
			to: "/",
			label: "Cleanplate",
			icon: LogoIcon,
			className: "space-x-2 flex items-center",
			activeClassName: "underline decoration-primary underline-offset-4",
			asLogo: true,
		},
		{
			to: "/map",
			label: "Map",
			icon: MapIcon,
			className: "flex items-center gap-1",
			activeClassName:
				"text-primary underline decoration-primary underline-offset-4",
		},
		{
			to: "/table",
			label: "Table",
			icon: SheetIcon,
			className: "flex items-center gap-1",
			activeClassName:
				"text-primary underline decoration-primary underline-offset-4",
		},
		{
			to: "/chart",
			label: "Chart",
			icon: ChartBarIcon,
			className: "flex items-center gap-1",
			activeClassName:
				"text-primary underline decoration-primary underline-offset-4",
		},
	];

	// Initialize from localStorage on the client so the initial React render
	// matches the pre-hydration script that sets the same class on <html>.
	const [isDark, setIsDark] = React.useState<boolean>(() => {
		try {
			return localStorage.getItem("theme") === "dark";
		} catch {
			return false;
		}
	});

	// Persist changes to theme and update document class
	React.useEffect(() => {
		try {
			localStorage.setItem("theme", isDark ? "dark" : "light");
		} catch {}

		if (typeof document !== "undefined") {
			document.documentElement.classList.toggle("dark", isDark);
		}
	}, [isDark]);

	return (
		<header className="p-2 bg-muted/50 text-muted-foreground">
			<div className="max-w-6xl mx-auto flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Link to="/" className="flex items-center space-x-2 font-bold">
						<LogoIcon />
						<span className="hidden sm:inline text-foreground">Cleanplate</span>
					</Link>
				</div>

				<nav className="hidden md:flex md:gap-4 md:items-center">
					{LINKS.filter((l) => !l.asLogo).map((l) => (
						<Link
							key={l.to}
							to={l.to}
							className={`${l.className} px-2 font-bold`}
							activeProps={{ className: l.activeClassName }}
						>
							<l.icon className="inline-block mr-1" /> {l.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<Button
						aria-label="Toggle theme"
						size="icon"
						onClick={() => setIsDark((s) => !s)}
						variant="outline"
					>
						{/* Render both icons so the server markup matches the client markup.
							Visibility is controlled purely by CSS (dark: utilities). */}
						<Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
						<Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
						<span className="sr-only">Toggle theme</span>
					</Button>

					<Sheet>
						<SheetTrigger asChild>
							<Button
								className="md:hidden"
								aria-label="Open menu"
								size="icon"
								variant="outline"
							>
								<Menu className="size-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left">
							<SheetHeader>
								<SheetTitle className="flex items-center gap-2">
									<LogoIcon />
									<strong className="text-primary font-extrabold tracking-wider text-lg uppercase">
										Cleanplate
									</strong>
								</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-6 px-2">
								{LINKS.filter((l) => !l.asLogo).map((l) => (
									<SheetClose asChild key={l.to}>
										<Link
											to={l.to}
											className={`${l.className} px-2 font-bold block`}
											activeProps={{ className: l.activeClassName }}
										>
											<l.icon className="inline-block mr-2" /> {l.label}
										</Link>
									</SheetClose>
								))}
							</nav>
							<SheetFooter className="mt-auto font-bold text-center flex-row justify-center items-center gap-2">
								<CopyrightIcon /> {new Date().getFullYear()} Cleanplate
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
