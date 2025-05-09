"use client";

import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="text-center py-16 bg-gradient-to-b from-primary/10 to-background rounded-xl shadow-lg border border-border/50">
      <div className="max-w-4xl mx-auto px-4">
        <Droplets className="mx-auto h-20 w-20 text-primary mb-6 animate-bounce" />
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Welcome to Qatrah Hayat
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Your connection to saving lives. Donate blood, find donation centers, and track your impact.
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <Button 
            size="lg" 
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/find-donation">Find a Donation Center</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            asChild
            className="border-2 hover:bg-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/request-blood">Request Blood</Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 