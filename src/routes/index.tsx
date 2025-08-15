import { RestaurantList } from "@/components/restaurant-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="text-center">
			<RestaurantList />
		</div>
	);
}
