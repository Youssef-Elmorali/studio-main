"use client";

import { Search, Gift, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-10 text-primary">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8 text-center relative">
        {/* Connecting Lines (Desktop Only) */}
        <div className="hidden md:block absolute top-1/3 left-0 right-0 transform -translate-y-1/2 h-16">
          <div className="flex justify-center items-center h-full">
            <div className="w-1/4 border-t-2 border-primary/30 border-dashed"></div>
            <div className="w-1/4 border-t-2 border-primary/30 border-dashed"></div>
          </div>
        </div>

        <div className="relative flex flex-col items-center p-6 z-10">
          <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-lg">
            <Search className="h-8 w-8"/>
          </div>
          <h3 className="text-xl font-semibold mb-2">1. Find a Center</h3>
          <p className="text-muted-foreground">Use our search tool to locate nearby donation centers or mobile blood drives.</p>
        </div>

        <div className="relative flex flex-col items-center p-6 z-10">
          <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-lg">
            <Gift className="h-8 w-8"/>
          </div>
          <h3 className="text-xl font-semibold mb-2">2. Donate Blood</h3>
          <p className="text-muted-foreground">Schedule an appointment and complete the simple, safe donation process (about 1 hour).</p>
        </div>

        <div className="relative flex flex-col items-center p-6 z-10">
          <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle className="h-8 w-8"/>
          </div>
          <h3 className="text-xl font-semibold mb-2">3. Make an Impact</h3>
          <p className="text-muted-foreground">Your donation is processed and delivered to hospitals, ready to help patients in need.</p>
        </div>
      </div>
    </section>
  );
} 