import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { Footer } from "@/components/footer.tsx";
import { NavMenu } from "@/components/nav-menu.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import TanStackQueryLayout from "@/integrations/tanstack-query/layout.tsx";
import {
	SITE_DEFAULT_DESCRIPTION,
	SITE_DEFAULT_OG_IMAGE,
	SITE_NAME,
} from "@/lib/constants";
// Hybrid: server provides initial theme (cookie) and client ScriptOnce uses it to avoid FOUC
import { getThemeServerFn } from "@/lib/theme";
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
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
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
			{ rel: "manifest", href: "/manifest.json" },
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
	errorComponent: DefaultCatchBoundary,
	loader: async () => {
		return getThemeServerFn();
	},
	shellComponent: RootWrapper,
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

function RootWrapper({ children }: { children: React.ReactNode }) {
	// loader data is the theme (string 'light'|'dark')
	const theme = Route.useLoaderData();
	return (
		<ThemeProvider theme={theme}>
			<RootDocument>{children}</RootDocument>
		</ThemeProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
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
