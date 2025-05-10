"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Phone, Clock, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import { db } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { BloodBank } from "@/types/blood-bank";

// Dynamically import MapView with no SSR
const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

export default function DonatePage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [banks, setBanks] = React.useState<BloodBank[]>([]);
  const [selectedBank, setSelectedBank] = React.useState<BloodBank | null>(null);
  const [selectedCity, setSelectedCity] = React.useState<string>("all");
  const [selectedBloodType, setSelectedBloodType] = React.useState<string>("all");

  // Fetch blood banks
  React.useEffect(() => {
    const fetchBanks = async () => {
      if (!db) return;
      setLoading(true);
      try {
        const banksRef = collection(db, "blood_banks");
        const banksSnapshot = await getDocs(banksRef);
        const banksData = banksSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            location: data.location || '',
            locationCoords: data.locationCoords || { lat: 0, lng: 0 },
            contactPhone: data.contactPhone,
            operatingHours: data.operatingHours,
            website: data.website,
            inventory: data.inventory || {},
            lastInventoryUpdate: data.lastInventoryUpdate,
            servicesOffered: data.servicesOffered || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as BloodBank;
        });
        setBanks(banksData);
      } catch (error) {
        console.error("Error fetching blood banks:", error);
        toast({
          title: "Error",
          description: "Failed to load blood banks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, [toast]);

  // Filter banks based on city and blood type
  const filteredBanks = React.useMemo(() => {
    return banks.filter((bank) => {
      if (!bank) return false;
      
      const matchesCity = selectedCity === 'all' || 
        bank.location.toLowerCase().includes(selectedCity.toLowerCase());
      
      const matchesBloodType = selectedBloodType === 'all' || 
        Object.keys(bank.inventory || {}).includes(selectedBloodType);
      
      return matchesCity && matchesBloodType;
    });
  }, [banks, selectedCity, selectedBloodType]);

  const handleBankSelect = (bank: BloodBank) => {
    setSelectedBank(bank);
  };

  // Memoize the map component to prevent unnecessary re-renders
  const MapComponent = React.useMemo(() => (
    <MapView
      key="donate-map"
      locations={filteredBanks.map(bank => ({
        ...bank,
        type: 'blood_bank' as const,
      }))}
      onLocationSelect={handleBankSelect}
      center={selectedCity !== 'all' 
        ? EGYPTIAN_CITIES.find(city => city.name === selectedCity)?.lat 
          ? { 
              lat: EGYPTIAN_CITIES.find(city => city.name === selectedCity)!.lat,
              lng: EGYPTIAN_CITIES.find(city => city.name === selectedCity)!.lng
            }
          : undefined
        : undefined
      }
    />
  ), [filteredBanks, handleBankSelect, selectedCity]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Donate Blood</h1>
          <p className="text-muted-foreground mt-2">
            Find a blood bank near you and schedule your donation.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {EGYPTIAN_CITIES.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Blood Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blood Types</SelectItem>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              {MapComponent}
            </CardContent>
          </Card>
        </div>

        {/* Blood Banks List */}
        <div className="space-y-4">
          {filteredBanks.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No blood banks found in this city.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredBanks.map((bank) => (
              <Card 
                key={bank.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedBank?.id === bank.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleBankSelect(bank)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{bank.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {bank.location}
                        </p>
                      </div>
                      <Link href={`/donate/banks/${bank.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Object.entries(bank.inventory || {}).map(([type, count]) => (
                        <Badge 
                          key={type}
                          variant={count > 10 ? "default" : count > 0 ? "secondary" : "destructive"}
                        >
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {bank.contactPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {bank.contactPhone}
                        </span>
                      )}
                      {bank.operatingHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {bank.operatingHours}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 