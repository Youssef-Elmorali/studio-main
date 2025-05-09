"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone, Loader2 } from 'lucide-react';
import Link from "next/link";
import { db } from '@/lib/firebase/client';
import { collection, query, limit, getDocs } from 'firebase/firestore';

interface DonationCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  distance: string;
}

export default function DonationCenters() {
  const [centers, setCenters] = React.useState<DonationCenter[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCenters = async () => {
      if (!db) return;
      try {
        const centersRef = collection(db, 'donation_centers');
        const q = query(centersRef, limit(3)); // Show only 3 nearest centers
        const snapshot = await getDocs(q);
        const fetchedCenters = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DonationCenter));
        setCenters(fetchedCenters);
      } catch (error) {
        console.error("Error fetching donation centers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Nearby Donation Centers</CardTitle>
          <CardDescription>Loading nearby centers...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (centers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Nearby Donation Centers</CardTitle>
          <CardDescription>No donation centers found in your area.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/find-donation">Find More Centers</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Nearby Donation Centers</CardTitle>
        <CardDescription>Find the closest blood donation centers to you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {centers.map((center) => (
          <div
            key={center.id}
            className="p-4 border rounded-lg bg-card space-y-3 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{center.name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{center.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{center.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{center.phone}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Badge variant="secondary">{center.distance}</Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/find-donation/${center.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        ))}
        <Button asChild className="w-full mt-4">
          <Link href="/find-donation">View All Centers</Link>
        </Button>
      </CardContent>
    </Card>
  );
} 