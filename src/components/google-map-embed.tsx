"use client";

import React from 'react';
import { Globe, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { BloodBank } from '@/types/blood-bank';

interface GoogleMapEmbedProps {
  locations?: (BloodBank & { type: 'blood_bank' })[];
  onLocationSelect?: (location: BloodBank) => void;
  center?: { lat: number; lng: number };
  title?: string;
}

export default function GoogleMapEmbed({
  locations = [],
  onLocationSelect,
  center,
  title = "Blood Banks Map"
}: GoogleMapEmbedProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<BloodBank | null>(null);
  const [mapUrl, setMapUrl] = React.useState('');

  // Default center to Cairo if no center is provided
  const defaultCenter = { lat: 30.0444, lng: 31.2357 };
  const mapCenter = center || defaultCenter;

  // Generate map URL with markers
  React.useEffect(() => {
    const baseUrl = 'https://www.google.com/maps/embed/v1/place';
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key is not configured');
      return;
    }

    // Create markers for all locations
    const markers = locations
      .filter(location => location?.locationCoords)
      .map(location => {
        const { lat, lng } = location.locationCoords;
        return `${lat},${lng}`;
      })
      .join('|');

    // Construct the URL
    const url = new URL(baseUrl);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('q', searchQuery || `${mapCenter.lat},${mapCenter.lng}`);
    if (markers) {
      url.searchParams.append('markers', markers);
    }
    url.searchParams.append('zoom', '12');

    setMapUrl(url.toString());
  }, [locations, searchQuery, mapCenter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The map will update automatically through the useEffect
  };

  const handleLocationClick = (location: BloodBank) => {
    setSelectedLocation(location);
    if (location.locationCoords) {
      setSearchQuery(location.name);
    }
    onLocationSelect?.(location);
  };

  return (
    <div className="space-y-4 p-4 md:p-6 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold flex items-center justify-center mb-4">
        <Globe className="mr-2 h-5 w-5 text-primary"/>{title}
      </h3>
      
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
        <Label htmlFor="map-search" className="sr-only">Search Location</Label>
        <Input
          id="map-search"
          type="search"
          placeholder="Search for a blood bank..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow bg-background"
        />
        <Button type="submit" variant="outline">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </form>

      <div className="relative h-[400px] w-full bg-muted-foreground/10 rounded-md overflow-hidden border">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={title}
          />
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map Configuration Error</AlertTitle>
            <AlertDescription>
              Google Maps API key is required for map functionality.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        {locations.map((location) => (
          <div
            key={location.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedLocation?.id === location.id
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-muted'
            }`}
            onClick={() => handleLocationClick(location)}
          >
            <h4 className="font-medium">{location.name}</h4>
            <p className="text-sm text-muted-foreground">{location.location}</p>
            {location.contactPhone && (
              <p className="text-sm text-muted-foreground">Phone: {location.contactPhone}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
