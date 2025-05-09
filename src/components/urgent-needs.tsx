"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Loader2 } from 'lucide-react';
import Link from "next/link";
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface UrgentNeed {
  id: string;
  bloodType: string;
  location: string;
  urgency: 'Critical' | 'High' | 'Medium';
  createdAt: Date;
}

export default function UrgentNeeds() {
  const [urgentNeeds, setUrgentNeeds] = React.useState<UrgentNeed[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUrgentNeeds = async () => {
      if (!db) return;
      try {
        const needsRef = collection(db, 'urgent_needs');
        const q = query(
          needsRef,
          orderBy('createdAt', 'desc'),
          limit(3) // Show only the 3 most recent urgent needs
        );
        const snapshot = await getDocs(q);
        const fetchedNeeds = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        } as UrgentNeed));
        setUrgentNeeds(fetchedNeeds);
      } catch (error) {
        console.error("Error fetching urgent needs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentNeeds();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-md border border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-destructive flex items-center">
            <Megaphone className="mr-2 h-5 w-5 animate-pulse"/>Urgent Needs
          </CardTitle>
          <CardDescription>Loading urgent needs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (urgentNeeds.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-md border border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-destructive flex items-center">
          <Megaphone className="mr-2 h-5 w-5 animate-pulse"/>Urgent Needs
        </CardTitle>
        <CardDescription>Critical blood requests in your area. Your donation can make a difference immediately.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4">
          {urgentNeeds.map((need) => (
            <div
              key={need.id}
              className="flex items-center gap-2 p-3 bg-background rounded-lg shadow-sm"
            >
              <Badge
                variant={
                  need.urgency === 'Critical'
                    ? 'destructive'
                    : need.urgency === 'High'
                    ? 'default'
                    : 'secondary'
                }
              >
                {need.bloodType}
              </Badge>
              <span className="text-sm font-medium">{need.location}</span>
              <Badge variant="outline" className="ml-auto">
                {need.urgency}
              </Badge>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Button variant="destructive" asChild>
            <Link href="/request">View All Urgent Requests</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 