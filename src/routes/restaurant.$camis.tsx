import { restaurantQueries } from "@/utils/restaurant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/restaurant/$camis")({
	component: RouteComponent,
	loader: ({ context: { queryClient }, params: { camis } }) => {
		return queryClient.ensureQueryData(restaurantQueries.detail(camis));
	},
});

function RouteComponent() {
	const { camis } = Route.useParams();
	const {
		data: { restaurants },
	} = useSuspenseQuery(restaurantQueries.detail(camis));

	return (
		<div>
			Hello "/restaurant/$camis" <h1>{restaurants?.[0]?.camis}</h1>
		</div>
	);
}
