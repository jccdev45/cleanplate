import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Restaurant } from "@/types/restaurant";

interface RestaurantMapProps {
	restaurants: Restaurant[];
}

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
	// Default NYC center
	const position = [40.73229776539821, -73.90569900252457];

	// Custom marker icon for better visibility
	const markerIcon = L.icon({
		iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
		shadowSize: [41, 41],
	});
	return (
		<MapContainer
			center={position as L.LatLngTuple}
			zoom={11.5}
			scrollWheelZoom={true}
			className="w-full h-full rounded-lg shadow-lg"
			style={{ minHeight: "60vh", maxHeight: "80vh" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
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
					>
						<Popup>
							<div className="font-bold text-base mb-1">{r.dba}</div>
							<div className="text-xs mb-1">{r.cuisine_description}</div>
							<div className="text-xs">
								{r.building} {r.street}, {r.zipcode}
							</div>
							<a
								href={`/restaurant/${r.camis}`}
								className="text-blue-600 underline text-xs mt-2 block"
							>
								View Details
							</a>
						</Popup>
					</Marker>
				))}
		</MapContainer>
	);
}
