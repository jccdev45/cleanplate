import { ChartSidebar } from "@/components/charts/chart-sidebar";
import GenericErrorComponent from "@/components/shared/generic-error";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import getSidebarStateServerFn from "@/lib/sidebar";
import {
	type ErrorComponentProps,
	Outlet,
	createFileRoute,
} from "@tanstack/react-router";

export const Route = createFileRoute("/chart/_chart-layout")({
	loader: async () => {
		// read the sidebar cookie on the server and return it so the layout
		// can use it as defaultOpen to avoid client-only effects.
		const val = await getSidebarStateServerFn();
		return { defaultOpen: val };
	},

	errorComponent: (props: ErrorComponentProps) => (
		<GenericErrorComponent {...props} title="charts" />
	),
	component: ChartLayout,
});

function ChartLayout() {
	const loaderData = Route.useLoaderData() as
		| { defaultOpen?: boolean }
		| undefined;
	const defaultOpen = loaderData?.defaultOpen ?? true;

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<div className="min-h-screen flex container mx-auto px-2">
				<ChartSidebar />
				<SidebarInset className="flex-1">
					<SidebarTrigger className="block sm:hidden" />
					<div className="mx-auto p-4 w-full sm:p-0">
						<Outlet />
					</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
