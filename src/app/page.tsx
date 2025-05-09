// src/app/page.tsx
import { EmergencyRequestBadge } from "@/components/emergency-request-badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Megaphone, Droplets, CalendarCheck, Target, MapPin, UserCheck, Link as LinkIcon, HeartPulse, CheckCircle, Search, Gift } from 'lucide-react';
import Link from "next/link";
import Image from 'next/image';
import DonationJourney from "@/components/donation-journey";
import UrgentNeeds from '@/components/urgent-needs';
import Hero from '@/components/hero';
import DonationCenters from '@/components/donation-centers';
import DonationStats from '@/components/donation-stats';
import WhyDonate from '@/components/why-donate';
import HowItWorks from '@/components/how-it-works';
import Campaigns from '@/components/campaigns';

// Mock Data - Replace with actual data fetching (e.g., from Firestore)
const campaigns = [
  { id: 1, title: "Summer Blood Drive", date: "July 15, 2024", location: "City Center Mall", organizer: "Red Crescent", status: "Upcoming", goal: 100, collected: 0 },
  { id: 2, title: "Emergency Response Campaign", date: "June 1, 2024", location: "Central Hospital", organizer: "Ministry of Health", status: "Ongoing", goal: 200, collected: 75 },
  { id: 3, title: "Community Blood Drive", date: "May 15, 2024", location: "Community Center", organizer: "Local Health Department", status: "Completed", goal: 150, collected: 150 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-16">
          <Hero />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-border/50">
              <UrgentNeeds />
            </div>
            <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-border/50">
              <DonationJourney />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-border/50">
              <DonationCenters />
            </div>
            <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-border/50">
              <DonationStats />
            </div>
            <Button 
              asChild 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/request-blood">
                <Droplets className="mr-2 h-4 w-4" />
                Request Blood
              </Link>
            </Button>
          </div>
        </div>

        {/* Why Donate Section */}
        <div className="mb-16">
          <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-border/50">
            <WhyDonate />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-border/50">
            <HowItWorks />
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="mb-16">
          <div className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-border/50">
            <Campaigns />
          </div>
        </div>
      </div>
    </main>
  );
}
