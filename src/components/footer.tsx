
"use client";

import Link from 'next/link';
import { Droplets, Facebook, Twitter, Instagram, DatabaseZap } from 'lucide-react';
import { seedDatabase } from '@/lib/firebase/seed'; // Adjust path as necessary
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { useToast } from '@/hooks/use-toast'; // For feedback

export function Footer() {
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    try {
      toast({ title: 'Seeding database...', description: 'Please wait.' });
      await seedDatabase();
      toast({ title: 'Success!', description: 'Database seeded successfully.' });
    } catch (error) {
      console.error('Error seeding database from footer:', error);
      toast({
        title: 'Error',
        description: `Failed to seed database: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <footer className="bg-muted text-muted-foreground border-t group relative">
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center text-primary">
              <Droplets className="mr-2 h-7 w-7" />
              <span className="font-bold text-xl">Qatrah Hayat</span>
            </Link>
            <p className="text-sm">Connecting blood donors with those in need, saving lives one drop at a time.</p>
             {/* Social Media Links */}
             <div className="flex space-x-4">
               <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                 <Facebook className="h-5 w-5" />
               </Link>
               <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                 <Twitter className="h-5 w-5" />
               </Link>
               <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                 <Instagram className="h-5 w-5" />
               </Link>
             </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Quick Links</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/donate" className="block hover:text-primary transition-colors">Find Donation Center</Link>
              <Link href="/request" className="block hover:text-primary transition-colors">Request Blood</Link>
              <Link href="/campaigns" className="block hover:text-primary transition-colors">Campaigns</Link>
              <Link href="/eligibility" className="block hover:text-primary transition-colors">Check Eligibility</Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Resources</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/about" className="block hover:text-primary transition-colors">About Us</Link>
              <Link href="/faq" className="block hover:text-primary transition-colors">FAQ</Link>
              <Link href="/contact" className="block hover:text-primary transition-colors">Contact Us</Link>
              <Link href="/privacy" className="block hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-primary transition-colors">Terms of Service</Link>
            </nav>
          </div>

          {/* Contact Info (Placeholder) */}
           <div>
             <h4 className="font-semibold mb-3 text-foreground">Contact</h4>
             <div className="space-y-2 text-sm">
               <p>123 Life Saver St, Cityville</p>
               <p>Email: <a href="mailto:info@qatrahhayat.org" className="hover:text-primary transition-colors">info@qatrahhayat.org</a></p>
               <p>Phone: <a href="tel:+1234567890" className="hover:text-primary transition-colors">(123) 456-7890</a></p>
             </div>
           </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs relative">
          <p>&copy; {new Date().getFullYear()} Qatrah Hayat. All rights reserved.</p>
          <p>Designed to connect and save lives.</p>
          {/* Seed Database Button - Visible on footer hover */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleSeedDatabase}
              className="bg-card hover:bg-card/90 border-primary text-primary hover:text-primary-foreground"
            >
              <DatabaseZap className="mr-2 h-4 w-4" />
              Seed Database
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
