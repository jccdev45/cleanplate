import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import * as React from "react";

// Main Hero component (slot-based)
function Hero({
	className,
	children,
	...props
}: {
	className?: string;
	children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
	return (
		<section
			className={cn(
				"relative h-[400px] overflow-hidden md:rounded-lg",
				className,
			)}
			{...props}
		>
			{children}
		</section>
	);
}

// HeroImages slot
function HeroMedia({
	images,
	autoPlay = true,
	...props
}: {
	images: Array<{
		src: string;
		type: string;
		alt: string;
	}>;
	autoPlay?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
	const [currentIndex, setCurrentIndex] = React.useState(0);
	const rafRef = React.useRef<number | null>(null);
	const lastTimeRef = React.useRef<number>(Date.now());

	const step = React.useCallback(() => {
		const now = Date.now();
		if (now - lastTimeRef.current >= 7000) {
			setCurrentIndex((prev) => (prev + 1) % images.length);
			lastTimeRef.current = now;
		}
		rafRef.current = window.requestAnimationFrame(step);
	}, [images.length]);

	React.useLayoutEffect(() => {
		if (!autoPlay || images.length < 2) return;
		rafRef.current = window.requestAnimationFrame(step);
		return () => {
			if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
		};
	}, [autoPlay, images.length, step]);

	return (
		<>
			{images.map((image, index) => (
				<div
					key={image.src}
					className={cn(
						"absolute inset-0 size-full transition-opacity duration-700 ease-in-out",
						index === currentIndex
							? "opacity-100"
							: "opacity-0 pointer-events-none",
					)}
					{...props}
				>
					{image.type === "video" ? (
						<video
							muted
							playsInline
							autoPlay
							loop
							preload="metadata"
							disablePictureInPicture
							className="size-full object-cover object-center"
						>
							<source src={image.src} type="video/mp4" />
						</video>
					) : (
						<img
							src={image.src}
							alt={image.alt || ""}
							decoding="async"
							loading="eager"
							className="size-full object-cover object-bottom"
						/>
					)}
				</div>
			))}
		</>
	);
}

// HeroTitle slot
function HeroTitle({
	children,
	...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h1
			className="text-4xl lg:text-5xl font-bold tracking-wide font-serif mb-2 z-10"
			{...props}
		>
			{children}
		</h1>
	);
}

// HeroSubtitle slot
function HeroSubtitle({
	children,
	...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p
			className="text-lg text-background dark:text-foreground mb-2 z-10"
			{...props}
		>
			{children}
		</p>
	);
}

// HeroCTA slot
function HeroCTA({
	children,
	to,
	...props
}: {
	children: React.ReactNode;
	to: string;
} & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className="mt-6 z-10" {...props}>
			<Button variant="secondary" size="lg" asChild>
				<Link to={to}>
					{children}
					<ArrowRight />
				</Link>
			</Button>
		</div>
	);
}

// HeroOverlay slot (optional, for background overlay)
function HeroOverlay({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className="absolute inset-0 bg-black/30" {...props} />;
}

// HeroContent slot (wraps text content)
function HeroContent({
	children,
	...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className="absolute inset-0 flex items-center justify-center"
			{...props}
		>
			<div className="space-y-2 text-center dark:text-foreground text-background bg-background/10 dark:bg-foreground/10 p-2 rounded-lg w-5/6 mx-auto max-w-md lg:max-w-xl text-balance z-10 backdrop-blur-xs">
				{children}
			</div>
		</div>
	);
}

export {
	Hero,
	HeroMedia,
	HeroTitle,
	HeroSubtitle,
	HeroCTA,
	HeroOverlay,
	HeroContent,
};
