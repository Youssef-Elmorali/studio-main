
"use client";

import React from 'react';
import { Globe, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface GoogleMapEmbedProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: Array<{
    position: google.maps.LatLngLiteral;
    title: string;
    address: string;
  }>;
  initialEmbedUrl?: string;
  title?: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearchSubmit?: (event: React.FormEvent) => void;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

export default function GoogleMapEmbed({
  center = { lat: 31.9632, lng: 35.9306 }, // Default to Jordan
  zoom = 7,
  markers = [],
  initialEmbedUrl,
  title,
  searchQuery = '',
  setSearchQuery,
  onSearchSubmit
}: GoogleMapEmbedProps) {
  const [isClient, setIsClient] = React.useState(false);
  const [currentEmbedUrl, setCurrentEmbedUrl] = React.useState(initialEmbedUrl);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (initialEmbedUrl) {
      setCurrentEmbedUrl(initialEmbedUrl);
    }
  }, [initialEmbedUrl]);

  // If using the Google Maps JavaScript API approach
  if (!initialEmbedUrl && apiKey) {
    return (
      <div className="space-y-4 p-4 md:p-6 border rounded-lg bg-muted/50 mt-8">
        <h3 className="text-lg font-semibold flex items-center justify-center mb-4">
          <Globe className="mr-2 h-5 w-5 text-primary"/>Interactive Map
        </h3>
        
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                title={marker.title}
                label={marker.title}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    );
  }

  // If using the embed URL approach
  return (
    <div className="space-y-4 p-4 md:p-6 border rounded-lg bg-muted/50 mt-8">
      <h3 className="text-lg font-semibold flex items-center justify-center mb-4">
        <Globe className="mr-2 h-5 w-5 text-primary"/>Map View
      </h3>

      {setSearchQuery && onSearchSubmit && (
        <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
          <Label htmlFor="map-search" className="sr-only">Search Location</Label>
          <Input
            id="map-search"
            type="search"
            placeholder="Search map location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-background"
          />
          <Button type="submit" variant="outline">
            <Search className="mr-2 h-4 w-4" /> Search Map
          </Button>
        </form>
      )}

      <div className="relative h-[400px] w-full bg-muted-foreground/10 rounded-md overflow-hidden border">
        {isClient ? (
          currentEmbedUrl ? (
            <iframe
              key={currentEmbedUrl}
              src={currentEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={title || "Map"}
            ></iframe>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing Map URL</AlertTitle>
              <AlertDescription>Map embed URL is required</AlertDescription>
            </Alert>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        )}
      </div>
      {currentEmbedUrl && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Map results are based on your search query.
        </p>
      )}
    </div>
  );
}
