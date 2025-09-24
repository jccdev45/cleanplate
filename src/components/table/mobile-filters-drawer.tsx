import { Button } from "@/components/ui/button";
// no React import required with the new JSX transform
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Sliders, X } from "lucide-react";

export function MobileFiltersDrawer({
	children,
	title = "Filters",
	triggerLabel = "Open filters",
}: {
	children: React.ReactNode;
	title?: string;
	triggerLabel?: string;
}) {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<button
					type="button"
					aria-label={triggerLabel}
					className="md:hidden inline-flex items-center gap-2 rounded-md border p-2 text-sm"
				>
					<Sliders className="w-4 h-4" />
					<span>Filters</span>
				</button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>{title}</DrawerTitle>
					<DrawerClose asChild>
						<button
							type="button"
							aria-label="Close filters"
							className="ml-auto p-1"
						>
							<X className="w-4 h-4" />
						</button>
					</DrawerClose>
				</DrawerHeader>
				<div className="p-4">{children}</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button className="w-full">Apply</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default MobileFiltersDrawer;
