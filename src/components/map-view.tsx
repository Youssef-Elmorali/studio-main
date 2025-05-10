"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { BloodBank } from "@/types/blood-bank";
import { Loader2 } from "lucide-react";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  locations: (BloodBank & { type: 'blood_bank' })[];
  onLocationSelect?: (location: BloodBank) => void;
  center?: { lat: number; lng: number };
}

// Singleton map instance
let mapInstance: L.Map | null = null;

// Client-side only map component
function ClientMap({ locations, onLocationSelect, center }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const defaultCenter: [number, number] = [30.0444, 31.2357];
  const mapCenter = center ? [center.lat, center.lng] : defaultCenter;

  // Filter out locations without valid coordinates
  const validLocations = locations.filter(location => 
    location.locationCoords && 
    typeof location.locationCoords.lat === 'number' && 
    typeof location.locationCoords.lng === 'number'
  );

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInstance = null;
      }
    };
  }, []);

  const handleMapRef = (map: L.Map | null) => {
    if (map) {
      // If there's an existing map instance, remove it
      if (mapInstance) {
        mapInstance.remove();
    }
      mapInstance = map;
      mapRef.current = map;
  }
  };

  return (
    <MapContainer
      center={[mapCenter[0], mapCenter[1]]} 
      zoom={center ? 12 : 6}
      style={{ height: "100%", width: "100%" }}
      ref={handleMapRef}
    >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
      {validLocations.map((location) => (
        <Marker 
          key={location.id} 
          position={[
            location.locationCoords?.lat ?? defaultCenter[0],
            location.locationCoords?.lng ?? defaultCenter[1]
          ]}
          eventHandlers={{
            click: () => onLocationSelect?.(location)
          }}
        >
                <Popup>
            <div className="p-2">
              <h3 className="font-bold">{location.name}</h3>
              <p className="text-sm text-gray-600">{location.location}</p>
              <p className="text-sm text-gray-500">{location.type}</p>
              {location.contactPhone && (
                <p className="text-sm text-gray-500">Phone: {location.contactPhone}</p>
              )}
            </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
  );
}

// Main component that handles client-side rendering
export default function MapView(props: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // Clean up the singleton instance when the component unmounts
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ClientMap {...props} />
    </div>
  );
}