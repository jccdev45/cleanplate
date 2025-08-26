import { restaurantQueries } from "@/utils/restaurant";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";

export function RestaurantList() {
	const params = useSearch({
		from: "/",
	});
	const { data, isLoading, error } = useQuery(restaurantQueries.list(params));

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading data</div>;

	return (
		<ul>
			Count: {data?.count}
			{data?.restaurants.map((r) => (
				<li key={r.camis}>
					<Link to={"/restaurant/$camis"} params={{ camis: r.camis }}>
						{r.dba}
					</Link>
				</li>
			))}
		</ul>
	);
}
