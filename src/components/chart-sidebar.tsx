import { Link } from "@tanstack/react-router";
import {
	Activity,
	BarChart2,
	ChartBarIcon,
	MapIcon,
	PieChartIcon,
} from "lucide-react";

export function ChartSidebar() {
	const items = [
		{ to: "/chart", label: "Overview", icon: ChartBarIcon },
		{ to: "/chart/cuisine", label: "Cuisine", icon: BarChart2 },
		{ to: "/chart/trends", label: "Trends", icon: Activity },
		{ to: "/chart/borough", label: "Borough", icon: MapIcon },
		{ to: "/chart/grade", label: "Grade", icon: PieChartIcon },
		{ to: "/chart/critical", label: "Critical", icon: PieChartIcon },
		{ to: "/chart/score", label: "Score", icon: BarChart2 },
	];

	return (
		<nav className="flex flex-col gap-2 p-4">
			{items.map((it) => (
				<Link
					key={it.to}
					to={it.to}
					className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted"
					activeProps={{ className: "bg-muted/50 font-semibold" }}
					activeOptions={{ exact: true }}
				>
					<it.icon className="size-4" />
					<span className="hidden lg:inline">{it.label}</span>
				</Link>
			))}
		</nav>
	);
}
