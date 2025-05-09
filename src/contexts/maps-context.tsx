"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

interface MapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const MapsContext = createContext<MapsContextType | undefined>(undefined);

export function MapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
    preventGoogleFontsLoading: true, // Prevent loading Google Fonts
  });

  if (loadError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load Google Maps. Please check your ad blocker settings or try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <MapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapsContext.Provider>
  );
}

export function useMaps() {
  const context = useContext(MapsContext);
  if (context === undefined) {
    throw new Error('useMaps must be used within a MapsProvider');
  }
  return context;
} 