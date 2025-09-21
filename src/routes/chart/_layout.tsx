import ChartSidebar from "@/components/chart-sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/chart/_layout")({
	component: ChartLayout,
});

// Pathless layout component used by chart overview and child routes.
export function ChartLayout({ children }: { children?: ReactNode }) {
	return (
		<div className="min-h-screen flex">
			<aside className="hidden lg:block w-64 border-r bg-sidebar/5">
				<ChartSidebar />
			</aside>
			<div className="flex-1">
				<div className="container mx-auto p-4 sm:p-6 lg:p-8">
					{/* Render either explicit children or nested Outlet */}
					{children ?? <Outlet />}
				</div>
			</div>
		</div>
	);
}
