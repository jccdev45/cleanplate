import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@/types/restaurant";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import L from "leaflet";
import { UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
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
				const z = (e.target as L.Map).getZoom();
				const c = (e.target as L.Map).getCenter();
				navigate({
					search: (prev) => ({
						...(prev || currentSearch || {}),
						minLat: b.getSouth(),
						maxLat: b.getNorth(),
						minLng: b.getWest(),
						maxLng: b.getEast(),
						markerOnly: "1",
						zoom: z,
						latitude: c.lat,
						longitude: c.lng,
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
					const z = (e.target as L.Map).getZoom();
					const c = (e.target as L.Map).getCenter();
					navigate({
						search: (prev) => ({
							...(prev || currentSearch || {}),
							minLat: b.getSouth(),
							maxLat: b.getNorth(),
							minLng: b.getWest(),
							maxLng: b.getEast(),
							markerOnly: "1",
							zoom: z,
							latitude: c.lat,
							longitude: c.lng,
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

function MapViewSync() {
	// synchronize the map view (center/zoom) with URL search params without
	// remounting the MapContainer. Use an effect so we don't call map.setView during render.
	const searchParams = useSearch({ from: "/map" });
	const map = useMap();

	useEffect(() => {
		if (!map) return;
		const latRaw = searchParams?.latitude;
		const lngRaw = searchParams?.longitude;
		const zRaw = searchParams?.zoom;
		const lat = latRaw === undefined ? undefined : Number(latRaw);
		const lng = lngRaw === undefined ? undefined : Number(lngRaw);
		const z = zRaw === undefined ? undefined : Number(zRaw);

		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

		// Now we can safely narrow types to number
		const latN = Number(lat);
		const lngN = Number(lng);
		const zN = Number.isFinite(Number(z)) ? Number(z) : undefined;

		try {
			const curr = map.getCenter();
			const currZoom = map.getZoom();
			const almostEqual = (a: number, b: number) => Math.abs(a - b) < 1e-6;
			// Avoid redundant setView which can trigger move events and navigation
			if (
				almostEqual(curr.lat, latN) &&
				almostEqual(curr.lng, lngN) &&
				(zN === undefined || zN === currZoom)
			) {
				return;
			}
			map.setView(
				[latN, lngN],
				Number.isFinite(zN as number) ? (zN as number) : currZoom,
				{ animate: true },
			);
		} catch (err) {
			// ignore
		}
	}, [
		searchParams?.latitude,
		searchParams?.longitude,
		searchParams?.zoom,
		map,
	]);

	return null;
}

type RestaurantMapProps = { restaurants: Restaurant[]; maxMarkers?: number };

export function RestaurantMap({ restaurants, maxMarkers }: RestaurantMapProps) {
	const searchParams = useSearch({ from: "/map" });

	// Default NYC center
	const position: [number, number] = [
		Number(searchParams?.latitude) || 40.73229776539821,
		Number(searchParams?.longitude) || -73.90569900252457,
	];
	const mapZoom = Number(searchParams?.zoom) || 13.5;

	// Custom marker icon for better visibility
	const markerIcon = L.icon({
		iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
		shadowSize: [41, 41],
	});

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
			center={position as L.LatLngTuple}
			zoom={mapZoom}
			scrollWheelZoom={true}
			className="w-full h-full rounded-lg shadow-lg z-0"
			style={{ minHeight: "60vh", maxHeight: "80vh" }}
		>
			<MapBoundsUpdater />
			<MapViewSync />
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
				options={{ minClusterSize: 5 }}
			>
				<MarkerVisibility
					restaurants={restaurants}
					maxMarkers={maxMarkers}
					markerIcon={markerIcon}
				/>
			</MarkerClusterGroup>
		</MapContainer>
	);
}

function MarkerVisibility({
	restaurants,
	maxMarkers,
	markerIcon,
}: {
	restaurants: Restaurant[];
	maxMarkers?: number;
	markerIcon: L.Icon<L.IconOptions>;
}) {
	// track map bounds and re-evaluate visible markers
	const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(
		null,
	);
	useMapEvents({
		moveend(e) {
			try {
				const m = e.target as L.Map;
				setCurrentBounds(m.getBounds());
			} catch (err) {
				setCurrentBounds(null);
			}
		},
		zoomend(e) {
			try {
				const m = e.target as L.Map;
				setCurrentBounds(m.getBounds());
			} catch (err) {
				setCurrentBounds(null);
			}
		},
	});

	const numeric = useMemo(
		() =>
			restaurants
				.filter((r) => r.latitude && r.longitude)
				.map((r) => ({
					...r,
					lat: Number.parseFloat(r.latitude ?? "0"),
					lng: Number.parseFloat(r.longitude ?? "0"),
				})),
		[restaurants],
	);

	const threshold = maxMarkers ?? Number.POSITIVE_INFINITY;

	const toRender = useMemo(() => {
		if (numeric.length <= threshold) return numeric;
		// try to filter by current viewport
		const b = currentBounds;
		if (b) {
			const within = numeric.filter((r) =>
				b.contains([r.lat, r.lng] as L.LatLngExpression),
			);
			if (within.length > 0) return within.slice(0, threshold);
		}
		// fallback: return first N
		return numeric.slice(0, threshold);
	}, [numeric, threshold, currentBounds]);

	return (
		<>
			{toRender.map((r) => (
				<Marker
					key={r.camis}
					position={[r.lat, r.lng]}
					icon={markerIcon}
					alt={r.dba}
				>
					<Popup autoPan={false}>
						<div className="font-bold text-base mb-1">{r.dba}</div>
						<div className="text-xs mb-1 flex items-center gap-1">
							<UtensilsCrossed className="size-4" />: {r.cuisine_description}
						</div>
						{r.inspections.length === 0 ? (
							<div className="text-muted-foreground">No inspections found.</div>
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
		</>
	);
}
