"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Users,
  Droplet,
  HeartHandshake,
  Settings,
  BarChart3,
  Bell,
  Calendar,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const adminNavItems = [
  {
    title: "Overview",
    href: "/dashboard/admin",
    icon: BarChart3,
  },
  {
    title: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Donations",
    href: "/dashboard/admin/donations",
    icon: Droplet,
  },
  {
    title: "Requests",
    href: "/dashboard/admin/requests",
    icon: HeartHandshake,
  },
  {
    title: "Campaigns",
    href: "/dashboard/admin/campaigns",
    icon: Calendar,
  },
  {
    title: "Locations",
    href: "/dashboard/admin/locations",
    icon: Map,
  },
  {
    title: "Notifications",
    href: "/dashboard/admin/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 pt-16">
        <div className="flex-1 flex flex-col min-h-0 bg-background border-r">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    "hover:bg-accent hover:text-accent-foreground",
                    "transition-colors duration-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                  />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:pl-64">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 