"use client";

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useMaps } from '@/contexts/maps-context';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Location {
  id: string | number;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  isEmergency?: boolean;
}

interface MapViewProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function MapView({ 
  locations, 
  onLocationSelect,
  center = { lat: 30.0444, lng: 31.2357 }, // Default to Cairo
  zoom = 12 
}: MapViewProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [mapError, setMapError] = React.useState<string | null>(null);
  const { isLoaded, loadError } = useMaps();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  React.useEffect(() => {
    if (!apiKey) {
      setMapError("Google Maps API key is missing");
      setIsLoading(false);
      return;
    }

    if (!locations.length) {
      setMapError("No blood banks found in this area");
      setIsLoading(false);
      return;
    }

    if (loadError) {
      setMapError("Failed to load Google Maps. Please check your ad blocker settings.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [locations, apiKey, loadError]);

  if (mapError) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <p className="text-destructive">{mapError}</p>
          <p className="text-muted-foreground">
            {mapError.includes("ad blocker") 
              ? "Please disable your ad blocker for this site to view the map."
              : "Try adjusting your search filters."}
          </p>
        </div>
      </Card>
    );
  }

  if (!isLoaded || isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative h-[600px] overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={{
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
          gestureHandling: 'greedy',
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.coordinates}
            title={location.name}
            onClick={() => onLocationSelect?.(location)}
          />
        ))}
      </GoogleMap>
    </Card>
  );
}