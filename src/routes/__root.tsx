import { Footer } from "@/components/footer.tsx";
import { NavMenu } from "@/components/nav-menu.tsx";
import TanStackQueryLayout from "@/integrations/tanstack-query/layout.tsx";
import {
	SITE_DEFAULT_DESCRIPTION,
	SITE_DEFAULT_OG_IMAGE,
	SITE_NAME,
} from "@/lib/constants";
import appCss from "@/styles.css?url";
import seo from "@/utils/seo";
import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const SITE_URL = process.env.SITE_URL ?? "";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "theme-color", content: "#0f172a" },
			...seo({
				title: SITE_NAME,
				description: SITE_DEFAULT_DESCRIPTION,
				image: SITE_URL
					? `${SITE_URL}${SITE_DEFAULT_OG_IMAGE}`
					: SITE_DEFAULT_OG_IMAGE,
				url: SITE_URL || undefined,
			}),
		],
		links: [
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/site.webmanifest" },
			{ rel: "icon", href: "/favicon.ico" },
			{ rel: "stylesheet", href: appCss },
			{
				rel: "stylesheet",
				href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
			},
			...(SITE_URL ? [{ rel: "canonical", href: SITE_URL }] : []),
		],
	}),

	notFoundComponent: NotFoundComponent,
	shellComponent: RootDocument,
});

function NotFoundComponent() {
	return (
		<main className="min-h-[60vh] flex items-center justify-center px-4">
			<div className="text-center">
				<h1 className="text-4xl font-extrabold mb-2">404 — Page not found</h1>
				<p className="text-muted-foreground mb-4">
					The page you were looking for does not exist or has been moved.
				</p>
				<div className="flex items-center justify-center gap-2">
					<a href="/" className="underline text-primary">
						Go back home
					</a>
				</div>
			</div>
		</main>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				{/* Pre-hydration script: apply saved theme (dark) before CSS loads to avoid flash */}
				<script>
					{`try{(function(){var k='theme';var s=null;try{s=localStorage.getItem(k)}catch(e){}if(s==='dark'){document.documentElement.classList.add('dark');}else if(s==='light'){document.documentElement.classList.remove('dark')}else{try{if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}}})()}catch(e){};`}
				</script>
			</head>
			<body>
				<NavMenu />
				{children}
				<Footer />
				<TanStackRouterDevtools />
				<TanStackQueryLayout />
				<Scripts />
			</body>
		</html>
	);
}
