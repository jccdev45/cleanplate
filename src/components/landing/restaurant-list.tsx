import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { DismissibleAlert } from "@/components/shared/dismissible-alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { Restaurant } from "@/types/restaurant";

type Props = {
	title: string;
	description: string;
	items?: Restaurant[];
	remoteDown?: boolean;
	fallbackCount?: number;
};

export function RestaurantList({
	title,
	description,
	items,
	remoteDown,
	fallbackCount = 6,
}: Props) {
	return (
		<section className="mb-16 animate-in fade-in duration-700">
			<h2 className="text-2xl font-semibold tracking-tight font-serif mb-2">
				{title}
			</h2>
			<p className="mb-4 text-sm text-muted-foreground">{description}</p>

			{remoteDown ? (
				<div className="mb-4">
					<DismissibleAlert
						title="Data temporarily unavailable"
						isActuallyDismissable={false}
					>
						The restaurant data is temporarily unavailable. Please try again
						later.
					</DismissibleAlert>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{items
						? items.map((r) => <RestaurantCard key={r.camis} restaurant={r} />)
						: Array.from({ length: fallbackCount }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<Skeleton key={i} className="h-48" />
							))}
				</div>
			)}
		</section>
	);
}
