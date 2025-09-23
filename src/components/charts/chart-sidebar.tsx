import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import {
	Activity,
	BarChart2,
	ChartBarIcon,
	MapIcon,
	PieChartIcon,
} from "lucide-react";

const items = [
	{ to: "/chart", label: "Overview", icon: ChartBarIcon },
	{ to: "/chart/cuisine", label: "Cuisine", icon: BarChart2 },
	{ to: "/chart/trends", label: "Trends", icon: Activity },
	{ to: "/chart/borough", label: "Borough", icon: MapIcon },
	{ to: "/chart/grade", label: "Grade", icon: PieChartIcon },
	{ to: "/chart/critical", label: "Critical", icon: PieChartIcon },
	{ to: "/chart/score", label: "Score", icon: BarChart2 },
];

export function ChartSidebar() {
	return (
		<Sidebar className="bg-transparent">
			<SidebarHeader>
				<div className="font-bold">Charts</div>
				<SidebarTrigger className="ml-auto" />
			</SidebarHeader>

			<SidebarContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.to}>
							<SidebarMenuButton asChild>
								<Link
									to={item.to}
									className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted"
									activeProps={{ className: "bg-muted/50 font-semibold" }}
									activeOptions={{ exact: true }}
								>
									<item.icon className="size-4" aria-hidden />
									<span>{item.label}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}
