"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserCheck, Calendar, HeartHandshake, ArrowRight } from 'lucide-react';
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

interface DonationStats {
  totalDonations: number;
  lastDonation: Date | null;
  nextEligibleDate: Date | null;
  impact: number; // Number of lives potentially saved
}

export default function DonationJourney() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = React.useState<DonationStats>({
    totalDonations: 0,
    lastDonation: null,
    nextEligibleDate: null,
    impact: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDonationStats = async () => {
      if (!user || !db) {
        setLoading(false);
        return;
      }

      try {
        const donationsRef = collection(db, 'donations');
        const q = query(
          donationsRef,
          where('donorId', '==', user.uid),
          where('status', '==', 'completed'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const snapshot = await getDocs(q);
        const totalDonations = snapshot.size;
        const lastDonation = snapshot.docs[0]?.data()?.createdAt?.toDate() || null;
        
        // Calculate next eligible date (56 days after last donation)
        const nextEligibleDate = lastDonation 
          ? new Date(lastDonation.getTime() + (56 * 24 * 60 * 60 * 1000))
          : null;

        setStats({
          totalDonations,
          lastDonation,
          nextEligibleDate,
          impact: totalDonations * 3 // Assuming each donation can save up to 3 lives
        });
      } catch (error) {
        console.error("Error fetching donation stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationStats();
  }, [user]);

  if (authLoading || loading) {
    return (
      <Card className="shadow-md bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <UserCheck className="mr-2 h-5 w-5"/>Your Donation Journey
          </CardTitle>
          <CardDescription>Loading your donation information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="shadow-md bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <UserCheck className="mr-2 h-5 w-5"/>Your Donation Journey
          </CardTitle>
          <CardDescription>Track your contributions and eligibility. Every drop counts!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-3">
            <p className="text-muted-foreground">Log in or sign up to track your donations and view your impact.</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <UserCheck className="mr-2 h-5 w-5"/>Your Donation Journey
        </CardTitle>
        <CardDescription>Track your contributions and eligibility. Every drop counts!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
                    <h3 className="text-2xl font-bold">{stats.totalDonations}</h3>
                  </div>
                  <HeartHandshake className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Donation</p>
                    <h3 className="text-2xl font-bold">
                      {stats.lastDonation 
                        ? format(stats.lastDonation, 'MMM d, yyyy')
                        : "Never"}
                    </h3>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lives Impacted</p>
                    <h3 className="text-2xl font-bold">{stats.impact}</h3>
                  </div>
                  <HeartHandshake className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Donation Status */}
          {stats.nextEligibleDate && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Eligible Donation</p>
                      <h3 className="text-lg font-semibold">
                        {format(stats.nextEligibleDate, 'MMMM d, yyyy')}
                      </h3>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <Progress 
                    value={Math.min(100, (Date.now() - (stats.lastDonation?.getTime() || 0)) / (56 * 24 * 60 * 60 * 1000) * 100)} 
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    {new Date() > stats.nextEligibleDate 
                      ? "You're eligible to donate again!"
                      : "Time until next donation"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild>
              <Link href="/find-donation">
                Find Donation Center
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile">View Full History</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 