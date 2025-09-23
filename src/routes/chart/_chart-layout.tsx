import { ChartSidebar } from "@/components/charts/chart-sidebar";
import GenericErrorComponent from "@/components/shared/generic-error";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { SITE_NAME } from "@/lib/constants";
import getSidebarStateServerFn from "@/lib/sidebar";
import { seo } from "@/utils/seo";
import {
	type ErrorComponentProps,
	Outlet,
	createFileRoute,
} from "@tanstack/react-router";

const SITE_URL = process.env.SITE_URL ?? "";

// Make this file the pathless layout for the `/chart` route so it wraps
// the `index` and child routes under `/chart/*` via the Outlet.
export const Route = createFileRoute("/chart/_chart-layout")({
	loader: async () => {
		// read the sidebar cookie on the server and return it so the layout
		// can use it as defaultOpen to avoid client-only effects.
		const val = await getSidebarStateServerFn();
		return { defaultOpen: val };
	},
	head: () => ({
		meta: seo({
			title: `Charts | ${SITE_NAME}`,
			description:
				"Visual dashboard for NYC restaurant inspection trends by borough, cuisine, and score.",
			image: SITE_URL
				? `${SITE_URL}/images/cosmic-diner.jpg`
				: "https://placehold.co/1200x630/0f172a/ffffff?font=roboto&text=Charts",
			url: SITE_URL ? `${SITE_URL}/chart` : undefined,
		}),
		links: [
			...(SITE_URL ? [{ rel: "canonical", href: `${SITE_URL}/chart` }] : []),
		],
	}),

	errorComponent: (props: ErrorComponentProps) => (
		<GenericErrorComponent {...props} title="charts" />
	),
	component: ChartLayout,
});

// Pathless layout component used by chart overview and child routes.
function ChartLayout() {
	const loaderData = Route.useLoaderData() as
		| { defaultOpen?: boolean }
		| undefined;
	const defaultOpen = loaderData?.defaultOpen ?? true;

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<div className="min-h-screen flex container mx-auto">
				<ChartSidebar />
				<SidebarInset className="flex-1">
					<SidebarTrigger />
					<div className="mx-auto p-4 w-full sm:p-6 lg:p-8">
						<Outlet />
					</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
