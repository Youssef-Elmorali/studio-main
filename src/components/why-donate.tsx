"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartPulse } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function WhyDonate() {
  return (
    <section className="py-12 px-6 bg-muted/50 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center mb-8 text-primary flex items-center justify-center">
        <HeartPulse className="mr-3 h-8 w-8"/>Why Donate Blood?
      </h2>
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-card rounded-lg shadow transition-transform hover:scale-105">
          <Image 
            src="https://picsum.photos/seed/saveLife/300/200" 
            alt="Save Lives" 
            width={300} 
            height={200} 
            className="rounded-md mb-4 mx-auto" 
          />
          <h3 className="text-xl font-semibold mb-2">Save Lives</h3>
          <p className="text-muted-foreground">
            A single donation can save up to three lives. Your blood is crucial for surgeries, cancer treatments, chronic illnesses, and traumatic injuries.
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg shadow transition-transform hover:scale-105">
          <Image 
            src="https://picsum.photos/seed/healthCheck/300/200" 
            alt="Health Benefits" 
            width={300} 
            height={200} 
            className="rounded-md mb-4 mx-auto" 
          />
          <h3 className="text-xl font-semibold mb-2">Health Check-up</h3>
          <p className="text-muted-foreground">
            Before donating, you receive a mini-health screening (pulse, blood pressure, temperature, hemoglobin) which can provide valuable health insights.
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg shadow transition-transform hover:scale-105">
          <Image 
            src="https://picsum.photos/seed/community/300/200" 
            alt="Community Support" 
            width={300} 
            height={200} 
            className="rounded-md mb-4 mx-auto" 
          />
          <h3 className="text-xl font-semibold mb-2">Support Your Community</h3>
          <p className="text-muted-foreground">
            Blood donation strengthens the community's health resources, ensuring blood is available when neighbours, friends, or family need it.
          </p>
        </div>
      </div>
      <div className="text-center mt-10">
        <Button variant="link" asChild className="text-primary">
          <Link href="/about#why-donate">Learn More About the Impact</Link>
        </Button>
      </div>
    </section>
  );
} 