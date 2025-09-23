import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import {
	Activity,
	BarChart2,
	ChartBarIcon,
	MapIcon,
	PieChartIcon,
} from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

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
	// useSidebar comes from our shadcn-style provider; fallback to local collapsed state
	type SidebarCtx = { state?: string; toggleSidebar?: () => void };

	let ctx: unknown = null;
	try {
		ctx = useSidebar();
	} catch (e) {
		// not inside provider
	}

	const [localCollapsed, setLocalCollapsed] = useLocalStorage<boolean>(
		"chart_sidebar_collapsed",
		false,
	);

	const collapsed =
		ctx && typeof ctx === "object" && ctx !== null && "state" in ctx
			? (ctx as SidebarCtx).state === "collapsed"
			: localCollapsed;

	const toggle = () => {
		if (
			ctx &&
			typeof ctx === "object" &&
			ctx !== null &&
			"toggleSidebar" in ctx
		) {
			(ctx as SidebarCtx).toggleSidebar?.();
		} else {
			setLocalCollapsed((s) => !s);
		}
	};

	return (
		<Sidebar className="bg-transparent">
			<SidebarHeader>
				<div className={`font-bold ${collapsed ? "sr-only" : ""}`}>Charts</div>
				<SidebarTrigger className="ml-auto" onClick={toggle} />
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
