import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@/types/restaurant";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import L from "leaflet";
import { UtensilsCrossed } from "lucide-react";
import { useRef } from "react";
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

function MapBoundsUpdater() {
	const navigate = useNavigate({ from: "/map" });
	const debounceRef = useRef<number | null>(null);
	const currentSearch = useSearch({ from: "/map" });

	useMapEvents({
		load: (e) => {
			try {
				const b = (e.target as L.Map).getBounds();
				navigate({
					search: (prev) => ({
						...(prev || currentSearch || {}),
						minLat: b.getSouth(),
						maxLat: b.getNorth(),
						minLng: b.getWest(),
						maxLng: b.getEast(),
						markerOnly: "1",
					}),
				});
			} catch (err) {
				// ignore
			}
		},
		moveend: (e) => {
			if (debounceRef.current) window.clearTimeout(debounceRef.current);
			debounceRef.current = window.setTimeout(() => {
				try {
					const b = (e.target as L.Map).getBounds();
					navigate({
						search: (prev) => ({
							...(prev || currentSearch || {}),
							minLat: b.getSouth(),
							maxLat: b.getNorth(),
							minLng: b.getWest(),
							maxLng: b.getEast(),
							markerOnly: "1",
						}),
					});
				} catch (err) {
					// ignore
				}
			}, 250) as unknown as number;
		},
	});

	return null;
}

type RestaurantMapProps = { restaurants: Restaurant[] };

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
	const searchParams = useSearch({ from: "/map" });

	// Default NYC center
	const position: [number, number] = [
		searchParams?.latitude || 40.73229776539821,
		searchParams?.longitude || -73.90569900252457,
	];
	const mapZoom = searchParams?.zoom || 11.5;

	// Custom marker icon for better visibility
	const markerIcon = L.icon({
		iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
		shadowSize: [41, 41],
	});
	// Custom cluster icon for better visibility
	interface Cluster {
		getChildCount: () => number;
	}

	function createClusterCustomIcon(cluster: Cluster): L.DivIcon {
		const count = cluster.getChildCount();
		return L.divIcon({
			html: `<div style="background:#2563eb;color:#fff;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);">${count}</div>`,
			className: "custom-cluster-icon",
			iconSize: [40, 40],
		});
	}

	return (
		<MapContainer
			key={`${position[0]}-${position[1]}-${mapZoom}`}
			center={position as L.LatLngTuple}
			zoom={mapZoom}
			scrollWheelZoom={true}
			className="w-full h-full rounded-lg shadow-lg z-0"
			style={{ minHeight: "60vh", maxHeight: "80vh" }}
		>
			<MapBoundsUpdater />
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<MarkerClusterGroup
				chunkedLoading
				showCoverageOnHover={false}
				spiderfyOnMaxZoom={true}
				maxClusterRadius={60}
				iconCreateFunction={createClusterCustomIcon}
				disableClusteringAtZoom={16}
				// Minimum cluster size to display as a cluster
				options={{
					minClusterSize: 5,
				}}
			>
				{restaurants
					.filter((r) => r.latitude && r.longitude)
					.map((r) => (
						<Marker
							key={r.camis}
							position={[
								Number.parseFloat(r.latitude ?? "0"),
								Number.parseFloat(r.longitude ?? "0"),
							]}
							icon={markerIcon}
							alt={r.dba}
						>
							<Popup>
								<div className="font-bold text-base mb-1">{r.dba}</div>
								<div className="text-xs mb-1 flex items-center gap-1">
									<UtensilsCrossed className="size-4" />:{" "}
									{r.cuisine_description}
								</div>
								{r.inspections.length === 0 ? (
									<div className="text-muted-foreground">
										No inspections found.
									</div>
								) : (
									<div className="flex items-center gap-2">
										<Badge
											variant={
												r.inspections[0]?.grade === "A"
													? "success"
													: r.inspections[0]?.grade === "B"
														? "secondary"
														: r.inspections[0]?.grade === "C"
															? "destructive"
															: "outline"
											}
										>
											Grade: {r.inspections[0]?.grade || "N/A"}
										</Badge>
										<Badge
											variant={
												r.inspections[0]?.critical_flag === "Critical"
													? "destructive"
													: "default"
											}
										>
											{r.inspections[0]?.critical_flag || "N/A"}
										</Badge>
									</div>
								)}
								<div className="text-xs">
									{r.building} {r.street},
								</div>
								<div className="text-xs">
									{r.boro} {r.zipcode}
								</div>
								<Link
									to="/restaurant/$camis"
									params={{ camis: r.camis }}
									target="_blank"
									className="text-blue-600 underline text-xs mt-2 block"
								>
									View Details
								</Link>
							</Popup>
						</Marker>
					))}
			</MarkerClusterGroup>
		</MapContainer>
	);
}
