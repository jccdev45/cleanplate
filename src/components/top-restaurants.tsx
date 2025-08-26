
import { restaurantQueries } from "@/utils/restaurant";
import { useQuery } from "@tanstack/react-query";
import { RestaurantCard } from "./restaurant-card";
import { Skeleton } from "./ui/skeleton";

export function TopRestaurants() {
  const { data, isLoading, error } = useQuery(
    restaurantQueries.list({
      grade: "A",
      $limit: 6,
      $order: "inspection_date DESC",
      $where: "grade = 'A'",
    }),
  );

  if (error) return <div>Error loading top restaurants...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading
        // biome-ignore lint/suspicious/noArrayIndexKey: <skeleton loaders, identical elements so i don't *think* it matters>
        ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)
        : data?.restaurants.map((r) => (
            <RestaurantCard key={r.camis} restaurant={r} />
          ))}
    </div>
  );
}
