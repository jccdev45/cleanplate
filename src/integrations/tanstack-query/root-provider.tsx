import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function getContext() {
	const queryClient = new QueryClient();
	return {
		queryClient,
	};
}

export function Provider({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

// Convenience helper for loaders and other non-React code to access
// a QueryClient instance. Import and call `getContext().queryClient` in loaders
// so preloads can prefetch into the same client used by the app.
export function getQueryClient() {
	return getContext().queryClient;
}
