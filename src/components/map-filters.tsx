import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const boroughData = {
	Manhattan: { latitude: 40.776676, longitude: -73.971321, zoom: 12 },
	Brooklyn: { latitude: 40.650002, longitude: -73.949997, zoom: 12 },
	Queens: { latitude: 40.742054, longitude: -73.769417, zoom: 12 },
	Bronx: { latitude: 40.837048, longitude: -73.865433, zoom: 12 },
	"Staten Island": { latitude: 40.579021, longitude: -74.151535, zoom: 12 },
};

export function MapFilters() {
	const searchParams = useSearch({ from: "/map" });
	const navigate = useNavigate({ from: "/map" });
	const [query, setQuery] = useState(searchParams?.$q || "");

	const handleSearch = () => {
		navigate({ search: (prev) => ({ ...prev, $q: query || undefined }) });
	};

	return (
		<div className="p-4 border-b flex flex-col gap-4">
			<div className="flex flex-col md:flex-row gap-4 items-center">
				<div className="w-full md:w-1/3 flex gap-2">
					<Input
						placeholder="Search restaurants..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
					/>
					<Button onClick={handleSearch}>Search</Button>
				</div>
				<div className="flex items-center gap-2">
					<span>Grade:</span>
					<Link
						to="/map"
						search={(prev) => ({ ...prev, grade: "A" })}
						className={`px-3 py-1 rounded-md text-sm ${searchParams?.grade === "A" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
					>
						A
					</Link>
					<Link
						to="/map"
						search={(prev) => ({ ...prev, grade: "B" })}
						className={`px-3 py-1 rounded-md text-sm ${searchParams?.grade === "B" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
					>
						B
					</Link>
					<Link
						to="/map"
						search={(prev) => ({ ...prev, grade: "C" })}
						className={`px-3 py-1 rounded-md text-sm ${searchParams?.grade === "C" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
					>
						C
					</Link>
					<Link
						to="/map"
						search={(prev) => ({ ...prev, grade: undefined })}
						className={`px-3 py-1 rounded-md text-sm ${!searchParams?.grade ? "bg-primary text-primary-foreground" : "bg-muted"}`}
					>
						All
					</Link>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<span>Borough:</span>
				{Object.entries(boroughData).map(([name, data]) => (
					<Link
						key={name}
						to="/map"
						search={(prev) => ({
							...prev,
							boro: name,
							latitude: data.latitude,
							longitude: data.longitude,
							zoom: data.zoom,
						})}
						className={`px-3 py-1 rounded-md text-sm ${searchParams?.boro === name ? "bg-primary text-primary-foreground" : "bg-muted"}`}
					>
						{name}
					</Link>
				))}
				<Link
					to="/map"
					search={(prev) => ({
						...prev,
						boro: undefined,
						latitude: undefined,
						longitude: undefined,
						zoom: undefined,
					})}
					className={`px-3 py-1 rounded-md text-sm ${!searchParams?.boro ? "bg-primary text-primary-foreground" : "bg-muted"}`}
				>
					All
				</Link>
			</div>
		</div>
	);
}
