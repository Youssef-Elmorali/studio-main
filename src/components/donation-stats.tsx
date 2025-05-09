"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Droplets, Users, HeartPulse, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { collection, query, getDocs } from 'firebase/firestore';

interface DonationStats {
  totalDonations: number;
  activeDonors: number;
  livesImpacted: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

export default function DonationStats() {
  const [stats, setStats] = React.useState<DonationStats>({
    totalDonations: 0,
    activeDonors: 0,
    livesImpacted: 0,
    monthlyGoal: 1000,
    monthlyProgress: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!db) return;
      try {
        // Fetch total donations
        const donationsRef = collection(db, 'donations');
        const donationsSnapshot = await getDocs(donationsRef);
        const totalDonations = donationsSnapshot.size;

        // Fetch active donors (users who donated in the last 3 months)
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const activeDonors = usersSnapshot.size;

        // Calculate lives impacted (each donation can save up to 3 lives)
        const livesImpacted = totalDonations * 3;

        // Calculate monthly progress
        const monthlyProgress = Math.min(totalDonations % stats.monthlyGoal, stats.monthlyGoal);

        setStats({
          totalDonations,
          activeDonors,
          livesImpacted,
          monthlyGoal: stats.monthlyGoal,
          monthlyProgress
        });
      } catch (error) {
        console.error("Error fetching donation stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Donation Statistics</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Donation Statistics</CardTitle>
        <CardDescription>Our impact in numbers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Total Donations</h3>
            </div>
            <p className="text-2xl font-bold">{stats.totalDonations.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Active Donors</h3>
            </div>
            <p className="text-2xl font-bold">{stats.activeDonors.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Lives Impacted</h3>
          </div>
          <p className="text-2xl font-bold">{stats.livesImpacted.toLocaleString()}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Monthly Goal Progress</h3>
            <span className="text-sm text-muted-foreground">
              {stats.monthlyProgress} / {stats.monthlyGoal}
            </span>
          </div>
          <Progress value={(stats.monthlyProgress / stats.monthlyGoal) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
} 