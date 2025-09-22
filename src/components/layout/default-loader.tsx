import { Coffee, Loader2 } from "lucide-react";

export function DefaultLoader({ text }: DefaultLoaderProps) {
	return (
		<main className="flex min-h-screen items-center justify-center p-6">
			<section aria-live="polite" className="flex flex-col items-center gap-4">
				<div className="flex items-center gap-4">
					<div
						aria-hidden
						className="relative flex items-center justify-center"
					>
						<BurgerSVG className="h-20 w-20 animate-bounce" />
						<span className="absolute -top-2 -right-2 animate-pulse text-amber-500">
							<Coffee className="h-6 w-6" />
						</span>
					</div>

					<div className="flex flex-col items-start">
						<div className="flex items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
							<h2 className="text-lg font-semibold">
								{text ?? "Cooking up something tasty..."}
							</h2>
						</div>
						<p className="text-sm text-muted-foreground">
							Finding the best bites near you
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="inline-flex items-center gap-2">
						<DotSteam className="h-4 w-4" delay={0} />
						<DotSteam className="h-4 w-4" delay={120} />
						<DotSteam className="h-4 w-4" delay={240} />
					</span>
					<span>Thanks for your patience — good food takes time 🍔</span>
				</div>
			</section>
		</main>
	);
}

/* Subcomponents */

function BurgerSVG({
	className = "",
}: {
	className?: string;
}) {
	return (
		<svg
			className={className}
			viewBox="0 0 64 64"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-hidden
		>
			<title>Loading</title>
			{/* Top bun */}
			<ellipse cx="32" cy="18" rx="26" ry="10" fill="#F6C179" />
			{/* Sesame seeds */}
			<g fill="#F9E6C5" opacity="0.95">
				<ellipse cx="22" cy="13" rx="2" ry="1.2" />
				<ellipse cx="30" cy="11" rx="2.2" ry="1.2" />
				<ellipse cx="40" cy="13" rx="1.8" ry="1" />
			</g>
			{/* Lettuce */}
			<path
				d="M10 26 C18 34, 46 34, 54 26 L54 30 C46 38, 18 38, 10 30 Z"
				fill="#9BE56B"
			/>
			{/* Patty */}
			<rect x="10" y="30" width="44" height="8" rx="2" fill="#7A3F2B" />
			{/* Cheese */}
			<polygon
				points="14,30 30,34 50,30 50,36 14,36"
				fill="#F2B844"
				opacity="0.95"
			/>
			{/* Bottom bun */}
			<ellipse cx="32" cy="42" rx="26" ry="8" fill="#ECA96B" />
		</svg>
	);
}

function DotSteam({
	className = "",
	delay = 0,
}: {
	className?: string;
	delay?: number;
}) {
	return (
		<span
			className={`${className} inline-block rounded-full bg-muted-foreground/60`}
			style={{
				width: 6,
				height: 6,
				transformOrigin: "center",
				animation: "steam 900ms infinite",
				animationDelay: `${delay}ms`,
			}}
			aria-hidden
		/>
	);
}

type DefaultLoaderProps = {
	text?: string;
};
