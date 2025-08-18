import { getRestaurants } from "@/utils/restaurant";
import { useQuery } from "@tanstack/react-query";

export function RestaurantList({ params }: { params?: URLSearchParams }) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["restaurants", params],
		queryFn: () => getRestaurants({ data: params }),
	});

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading data</div>;

	return (
		<ul>
			Count: {data?.count}
			{data?.restaurants.map((r) => (
				<li key={r.camis}>{r.dba}</li>
			))}
		</ul>
	);
}
