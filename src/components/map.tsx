"use client";

import * as React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'donation_center' | 'hospital' | 'campaign';
}

interface MapProps {
  locations: Location[];
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 14.5995, // Default to Philippines
  lng: 120.9842,
};

const getMarkerIcon = (type: Location['type']) => {
  switch (type) {
    case 'donation_center':
      return {
        url: '/markers/donation-center.svg',
        scaledSize: new window.google.maps.Size(32, 32),
      };
    case 'hospital':
      return {
        url: '/markers/hospital.svg',
        scaledSize: new window.google.maps.Size(32, 32),
      };
    case 'campaign':
      return {
        url: '/markers/campaign.svg',
        scaledSize: new window.google.maps.Size(32, 32),
      };
    default:
      return undefined;
  }
};

export function Map({ locations }: MapProps) {
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const bounds = React.useMemo(() => {
    if (!locations.length) return null;
    
    const newBounds = new window.google.maps.LatLngBounds();
    locations.forEach((location) => {
      if (location.lat && location.lng) {
        newBounds.extend({ lat: location.lat, lng: location.lng });
      }
    });
    return newBounds;
  }, [locations]);

  React.useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {locations.map((location) => (
          location.lat && location.lng && (
            <Marker
              key={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              title={location.name}
              icon={getMarkerIcon(location.type)}
            />
          )
        ))}
      </GoogleMap>
    </LoadScript>
  );
} 