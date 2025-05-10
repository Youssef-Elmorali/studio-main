"use client";

import React, { createContext, useContext, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  type: string;
}

interface MapsContextType {
  locations: Location[];
  loading: boolean;
  error: string | null;
  getLocations: () => Promise<Location[]>;
}

const MapsContext = createContext<MapsContextType | undefined>(undefined);

export function MapsProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocations = async (): Promise<Location[]> => {
    setLoading(true);
    setError(null);
    try {
      const locationsRef = collection(db, "locations");
      const snapshot = await getDocs(locationsRef);
      const locationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Location[];
      setLocations(locationsData);
      return locationsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch locations";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MapsContext.Provider value={{ locations, loading, error, getLocations }}>
      {children}
    </MapsContext.Provider>
  );
}

export function useMaps() {
  const context = useContext(MapsContext);
  if (context === undefined) {
    throw new Error("useMaps must be used within a MapsProvider");
  }
  return context;
} 