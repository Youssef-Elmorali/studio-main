"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Users, Droplet, Activity, Settings, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const routes = [
    {
      label: 'Users',
      icon: Users,
      href: '/admin/users',
      color: 'text-sky-500',
    },
    {
      label: 'Blood Banks',
      icon: Droplet,
      href: '/admin/blood-banks',
      color: 'text-violet-500',
    },
    {
      label: 'Activity',
      icon: Activity,
      href: '/admin/activity',
      color: 'text-pink-700',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-orange-700',
    },
  ];

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Admin Dashboard
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-x-2 text-sm font-medium p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors',
                  pathname === route.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                  isCollapsed && 'justify-center'
                )}
              >
                <route.icon className={cn('h-5 w-5', route.color)} />
                {!isCollapsed && <span>{route.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar className="w-64 border-r" />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
} 