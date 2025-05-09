"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Map } from '@/components/map';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'donation_center' | 'hospital' | 'campaign';
}

export default function LocationsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string>('all');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newLocation, setNewLocation] = React.useState<Partial<Location>>({
    name: '',
    address: '',
    type: 'donation_center',
  });
  const [geocoding, setGeocoding] = React.useState(false);

  React.useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
      return;
    }

    fetchLocations();
  }, [isAdmin, router]);

  const fetchLocations = async () => {
    if (!db) {
      toast({
        title: "Error",
        description: "Database connection unavailable",
        variant: "destructive",
      });
      return;
    }

    try {
      const locationsQuery = query(collection(db, 'locations'));
      const snapshot = await getDocs(locationsQuery);
      const fetchedLocations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Location));
      setLocations(fetchedLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    try {
      setLoading(true);
      setGeocoding(true);

      const coordinates = await geocodeAddress(newLocation.address!);
      if (!coordinates) {
        toast({
          title: "Error",
          description: "Could not find coordinates for the provided address",
          variant: "destructive",
        });
        return;
      }

      const docRef = await addDoc(collection(db, 'locations'), {
        ...newLocation,
        lat: coordinates.lat,
        lng: coordinates.lng,
        createdAt: new Date(),
      });
      
      toast({
        title: "Success",
        description: "Location added successfully",
      });
      
      setShowAddForm(false);
      setNewLocation({
        name: '',
        address: '',
        type: 'donation_center',
      });
      
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setGeocoding(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!db) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'locations', id));
      
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
      
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage donation centers, hospitals, and campaign locations</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Location</CardTitle>
            <CardDescription>Enter the details of the new location</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newLocation.type}
                    onValueChange={(value) => setNewLocation({ ...newLocation, type: value as Location['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donation_center">Donation Center</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={geocoding}>
                  {geocoding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Geocoding...
                    </>
                  ) : (
                    'Add Location'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle>All Locations</CardTitle>
              <CardDescription>View and manage all locations</CardDescription>
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="donation_center">Donation Centers</SelectItem>
                  <SelectItem value="hospital">Hospitals</SelectItem>
                  <SelectItem value="campaign">Campaigns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mb-4">
            <Map locations={filteredLocations} />
          </div>
          <div className="space-y-4">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteLocation(location.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 