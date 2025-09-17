import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { PostHogProvider } from "posthog-js/react";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const createRouter = () => {
	const rqContext = TanstackQuery.getContext();

	return routerWithQueryClient(
		createTanstackRouter({
			routeTree,
			context: { ...rqContext },
			// Preloading strategy tuned for this app:
			// - 'intent' preloads on hover/touchstart (low-cost, good UX)
			// - defaultPreloadDelay: 100ms reduces accidental preloads from fleeting hovers
			// - defaultPreloadStaleTime: 0 lets TanStack Query be the single source of truth
			//   for caching/staleness; loaders should call queryClient.prefetch/ensure
			defaultPreload: "intent",
			defaultPreloadDelay: 100,
			defaultPreloadStaleTime: 0,
			Wrap: (props: { children: React.ReactNode }) => {
				return (
					<PostHogProvider
						apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
						options={{
							api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
							defaults: "2025-05-24",
							capture_exceptions: true,
							debug: import.meta.env.MODE === "development",
						}}
					>
						<TanstackQuery.Provider {...rqContext}>
							{props.children}
						</TanstackQuery.Provider>
					</PostHogProvider>
				);
			},
		}),
		rqContext.queryClient,
	);
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}