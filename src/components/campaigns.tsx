"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, CalendarCheck, MapPin, Megaphone } from 'lucide-react';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Mock Data - Same as campaigns page
const allCampaigns = [
  { id: 1, title: "Summer Blood Drive", date: "July 15-20, 2024", location: "City Hall Plaza", goal: 200, collected: 150, organizer: "Community Blood Bank", status: "Ongoing" },
  { id: 2, title: "University Challenge", date: "August 5-9, 2024", location: "State University Campus", goal: 300, collected: 210, organizer: "Student Health Services", status: "Ongoing" },
  { id: 3, title: "Holiday Heroes", date: "December 1-5, 2024", location: "Downtown Center", goal: 250, collected: 0, organizer: "Red Cross Chapter", status: "Upcoming" },
];

export default function Campaigns() {
  return (
    <Card className="bg-card rounded-xl shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-primary flex items-center">
          <Target className="mr-2 h-6 w-6"/>Featured Donation Campaigns
        </CardTitle>
        <CardDescription className="text-base">Join upcoming events or see results from recent drives in your community.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {allCampaigns.map((campaign) => (
          <div 
            key={campaign.id} 
            className="p-4 border rounded-lg bg-background/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-foreground">{campaign.title}</h3>
              <Badge variant={campaign.status === 'Completed' ? 'secondary' : 'default'}>
                {campaign.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
              <span className="flex items-center">
                <CalendarCheck className="mr-1.5 h-4 w-4"/> {campaign.date}
              </span>
              <span className="flex items-center">
                <MapPin className="mr-1.5 h-4 w-4"/> {campaign.location}
              </span>
            </div>
            {campaign.status !== 'Completed' && (
              <div className="space-y-1">
                <Progress 
                  value={(campaign.collected / campaign.goal) * 100} 
                  className="h-2 bg-muted"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-primary">{campaign.collected} units collected</span>
                  <span className="text-muted-foreground">{campaign.goal} unit goal</span>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors">
                <Link href={`/campaigns/${campaign.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        ))}
        <div className="text-center pt-2">
          <Button variant="link" asChild>
            <Link href="/campaigns">View All Campaigns</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 