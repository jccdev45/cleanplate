import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";
import { useIsFetching } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import L from "leaflet";
import { UtensilsCrossed } from "lucide-react";
import { Loader2 } from "lucide-react";
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

function MapBoundsUpdater({
	onBoundsChange,
}: {
	onBoundsChange: (b: {
		minLat: number;
		maxLat: number;
		minLng: number;
		maxLng: number;
		zoom: number;
		latitude: number;
		longitude: number;
	}) => void;
}) {
	const debounceRef = useRef<number | null>(null);
	const currentSearch = useSearch({ from: "/map" });

	// tolerant numeric equality for query params which may be strings
	const nearlyEqual = (a?: number | string, b?: number, eps = 1e-4) => {
		if (a === undefined || a === null || b === undefined || b === null)
			return false;
		const an = Number(a);
		const bn = Number(b);
		if (!Number.isFinite(an) || !Number.isFinite(bn)) return false;
		return Math.abs(an - bn) <= Math.max(eps, Math.abs(bn) * 1e-4);
	};

	const shouldSetBounds = (newBounds: {
		minLat: number;
		maxLat: number;
		minLng: number;
		maxLng: number;
		zoom: number;
		latitude: number;
		longitude: number;
	}) => {
		// If current search params already reflect the new bounds (within a small epsilon), don't set pending
		if (!currentSearch) return true;
		try {
			// If any search param is missing, treat as different so button appears
			const keys = ["minLat", "maxLat", "minLng", "maxLng", "zoom"] as const;
			type Key = (typeof keys)[number];
			const comparisons = keys.map((k: Key) => {
				const cur = (currentSearch as Record<string, string | undefined>)[k];
				if (cur === undefined || cur === null) return false;
				const target = (newBounds as Record<Key, number>)[k];
				// use a looser epsilon for zoom (it's coarse)
				return k === "zoom"
					? nearlyEqual(cur, target, 1e-2)
					: nearlyEqual(cur, target, 1e-4);
			});

			// If epsilon checks already say it's different, show overlay
			const allSame = comparisons.every(Boolean);
			if (!allSame) return true;

			// Otherwise compute fractional displacement relative to current viewport size.
			// If user has panned away by more than thresholdFraction (e.g., 0.15 = 15%), show overlay.
			const thresholdFraction = 0.15; // configurable: 15% of viewport
			const curMinLat = Number(currentSearch.minLat);
			const curMaxLat = Number(currentSearch.maxLat);
			const curMinLng = Number(currentSearch.minLng);
			const curMaxLng = Number(currentSearch.maxLng);
			if (
				[curMinLat, curMaxLat, curMinLng, curMaxLng].some(
					(v) => !Number.isFinite(v),
				)
			) {
				return true;
			}

			const latSpan = Math.abs(curMaxLat - curMinLat);
			const lngSpan = Math.abs(curMaxLng - curMinLng);
			// avoid division by zero
			const latFrac =
				latSpan === 0
					? 1
					: Math.abs(newBounds.latitude - (curMinLat + curMaxLat) / 2) /
						latSpan;
			const lngFrac =
				lngSpan === 0
					? 1
					: Math.abs(newBounds.longitude - (curMinLng + curMaxLng) / 2) /
						lngSpan;
			// If either axis moved more than thresholdFraction of the viewport, prompt
			return latFrac > thresholdFraction || lngFrac > thresholdFraction;
		} catch (err) {
			return true;
		}
	};

	useMapEvents({
		load: (e) => {
			try {
				const b = (e.target as L.Map).getBounds();
				const z = (e.target as L.Map).getZoom();
				const c = (e.target as L.Map).getCenter();
				const nb = {
					minLat: b.getSouth(),
					maxLat: b.getNorth(),
					minLng: b.getWest(),
					maxLng: b.getEast(),
					zoom: z,
					latitude: c.lat,
					longitude: c.lng,
				};
				if (shouldSetBounds(nb)) onBoundsChange(nb);
			} catch (err) {
				// ignore
			}
		},
		moveend: (e) => {
			if (debounceRef.current) window.clearTimeout(debounceRef.current);
			// increase debounce slightly to avoid brief state flips while the user is still interacting
			debounceRef.current = window.setTimeout(() => {
				try {
					const b = (e.target as L.Map).getBounds();
					const z = (e.target as L.Map).getZoom();
					const c = (e.target as L.Map).getCenter();
					const nb = {
						minLat: b.getSouth(),
						maxLat: b.getNorth(),
						minLng: b.getWest(),
						maxLng: b.getEast(),
						zoom: z,
						latitude: c.lat,
						longitude: c.lng,
					};
					if (shouldSetBounds(nb)) onBoundsChange(nb);
				} catch (err) {
					// ignore
				}
			}, 1000) as unknown as number;
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

type RestaurantMapProps = { restaurants: Restaurant[] };

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
	const searchParams = useSearch({ from: "/map" });
	const isFetching = useIsFetching({
		queryKey: ["restaurants", searchParams],
	});
	const navigate = useNavigate({ from: "/map" });

	// No local effect: overlay visibility is derived from pendingBounds || isFetching

	const [pendingBounds, setPendingBounds] = useState<{
		minLat: number;
		maxLat: number;
		minLng: number;
		maxLng: number;
		zoom: number;
		latitude: number;
		longitude: number;
	} | null>(null);

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
		// wrapper keeps overlay outside of Leaflet's internal transformed container
		<div
			className="relative w-full h-full rounded-lg shadow-lg"
			style={{ minHeight: "60vh", maxHeight: "80vh" }}
		>
			<MapContainer
				center={position as L.LatLngTuple}
				zoom={mapZoom}
				scrollWheelZoom={true}
				className="w-full h-full z-0"
			>
				<MapBoundsUpdater onBoundsChange={setPendingBounds} />
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
					<MarkerVisibility restaurants={restaurants} markerIcon={markerIcon} />
				</MarkerClusterGroup>
			</MapContainer>

			{/* Overlay: show pending search control when user has panned/zoomed */}
			{(pendingBounds || Boolean(isFetching)) && (
				<div className="absolute bottom-4 inset-x-1/2 z-50 pointer-events-auto">
					<Button
						disabled={Boolean(isFetching)}
						onClick={() => {
							if (!pendingBounds) return;
							// Commit the pending bounds to the URL which triggers the route to fetch
							navigate({
								search: (prev) => ({
									...(prev || {}),
									minLat: pendingBounds.minLat,
									maxLat: pendingBounds.maxLat,
									minLng: pendingBounds.minLng,
									maxLng: pendingBounds.maxLng,
									markerOnly: "1",
									zoom: pendingBounds.zoom,
									latitude: pendingBounds.latitude,
									longitude: pendingBounds.longitude,
								}),
							});
							// hide pendingBounds; overlay will be visible while isFetching > 0
							setPendingBounds(null);
						}}
					>
						{isFetching ? (
							<span className="inline-flex items-center gap-2">
								<Loader2 className="size-4 animate-spin" />
								<span>Search this area</span>
							</span>
						) : (
							"Search this area"
						)}
					</Button>
				</div>
			)}
		</div>
	);
}

function MarkerVisibility({
	restaurants,
	markerIcon,
}: { restaurants: Restaurant[]; markerIcon: L.Icon<L.IconOptions> }) {
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

	const toRender = useMemo(() => {
		const b = currentBounds;
		if (!b) return numeric;
		return numeric.filter((r) =>
			b.contains([r.lat, r.lng] as L.LatLngExpression),
		);
	}, [numeric, currentBounds]);

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
