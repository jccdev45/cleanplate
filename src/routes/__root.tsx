import { Footer } from "@/components/footer.tsx";
import { NavMenu } from "@/components/nav-menu.tsx";
import TanStackQueryLayout from "@/integrations/tanstack-query/layout.tsx";
import appCss from "@/styles.css?url";
import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Cleanplate",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "stylesheet",
				href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
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
