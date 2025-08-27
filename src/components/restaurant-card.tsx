import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Restaurant } from "@/types/restaurant";
import { Link } from "@tanstack/react-router";
import { Badge } from "./ui/badge";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
	const latestInspection = restaurant.inspections[0];
	const grade = latestInspection?.grade;
	const score = latestInspection?.score;

	return (
		<Card className="hover:bg-muted/50 transition-colors">
			<CardHeader>
				<CardTitle className="text-lg flex items-center justify-between">
					<span>{restaurant.dba}</span>
					<Link
						to={"/restaurant/$camis"}
						params={{ camis: restaurant.camis }}
						className="text-xs text-primary underline"
					>
						More Details
					</Link>
				</CardTitle>
				<CardDescription>{restaurant.cuisine_description}</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">
					{restaurant.building} {restaurant.street}, {restaurant.boro}, NY{" "}
					{restaurant.zipcode}
				</p>
			</CardContent>
			<CardFooter className="flex justify-between">
				{grade && <Badge>{`Grade ${grade}`}</Badge>}
				{score !== undefined && (
					<Badge variant="secondary">{`Score ${score}`}</Badge>
				)}
			</CardFooter>
		</Card>
	);
}
