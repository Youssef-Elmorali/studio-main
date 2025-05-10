"use client";

import * as React from 'react';
import Link from 'next/link';
import { Droplets, UserCircle, HeartHandshake, Search, LogIn, UserPlus, Bell, LayoutDashboard, LogOut, Loader2, User, Calendar, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth'; // Use Firebase-based hook
import { auth } from '@/lib/firebase/client'; // Import Firebase auth instance
import { signOut } from 'firebase/auth'; // Import Firebase sign out function
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils'; // Import cn
import { NotificationsDropdown } from '@/components/notifications-dropdown';

export function Header() {
  const { user, userProfile, isAdmin, loading } = useAuth(); // Get user, profile, and admin status
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isLoggedIn = !!user;
  const notificationCount = isLoggedIn ? 3 : 0; // Placeholder

  const handleLogout = async () => {
    try {
       if (!auth) {
            toast({ title: "Logout Failed", description: "Authentication service unavailable.", variant: "destructive" });
            return;
       }
      await signOut(auth); // Use Firebase sign out
      toast({ title: "Logged out successfully." });
      router.push('/'); // Redirect to home page
      router.refresh(); // Force refresh to update layout state if needed elsewhere
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Failed", description: error.message || "An error occurred during logout.", variant: "destructive" });
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Find Donation', href: '/find-donation' },
    { name: 'Request Blood', href: '/request-blood' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  let authItems = [];
  let mobileAuthItems = [];

  if (loading) {
    authItems = [
      <Button key="loading" variant="ghost" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    ];
  } else if (isLoggedIn) {
    const welcomeName = userProfile?.firstName || user.email?.split('@')[0] || 'User';
    
    authItems = [
      <NotificationsDropdown key="notifications" />,
      <div key="welcome" className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
        <span>Welcome, {welcomeName}!</span>
      </div>,
      isAdmin ? (
        <Button key="dashboard" variant="ghost" asChild>
          <Link href="/dashboard/admin">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      ) : (
        <Button key="profile" variant="ghost" asChild>
          <Link href="/profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </Button>
      ),
      <Button key="logout" variant="ghost" onClick={handleLogout}>
        Logout
      </Button>
    ];

    mobileAuthItems = [
      <div key="welcome-mobile" className="px-4 py-3 border-b">
        <p className="text-sm font-medium">Welcome, {welcomeName}!</p>
      </div>,
      <div key="notifications-mobile" className="px-4 py-2">
        <NotificationsDropdown />
      </div>,
      isAdmin ? (
        <Link key="dashboard-mobile" href="/dashboard/admin" className="flex items-center px-4 py-3 text-sm hover:bg-accent">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Link>
      ) : (
        <Link key="profile-mobile" href="/profile" className="flex items-center px-4 py-3 text-sm hover:bg-accent">
          <User className="h-4 w-4 mr-2" />
          Profile
        </Link>
      ),
      <button key="logout-mobile" onClick={handleLogout} className="flex items-center px-4 py-3 text-sm hover:bg-accent w-full text-left">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </button>
    ];
  } else {
    authItems = [
      <Button key="login" variant="ghost" asChild>
        <Link href="/auth/login">Login</Link>
      </Button>,
      <Button key="signup" asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    ];

    mobileAuthItems = [
      <Link key="login-mobile" href="/auth/login" className="flex items-center px-4 py-3 text-sm hover:bg-accent">
        <LogIn className="h-4 w-4 mr-2" />
        Login
      </Link>,
      <Link key="signup-mobile" href="/auth/signup" className="flex items-center px-4 py-3 text-sm hover:bg-accent">
        <UserPlus className="h-4 w-4 mr-2" />
        Sign Up
      </Link>
    ];
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Droplets className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">Qatrah Hayat</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-primary flex items-center gap-1",
                pathname === item.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth, Greeting, Notification & Theme Buttons */}
        <div className="hidden md:flex items-center space-x-3 ml-auto">
          {authItems}
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          {loading && (
            <>
              <Button variant="ghost" size="icon" disabled className="w-8 h-8 animate-pulse bg-muted rounded-full"></Button>
              <Button variant="ghost" size="icon" disabled className="w-8 h-8 animate-pulse bg-muted rounded-full"></Button>
            </>
          )}
          {isLoggedIn && !loading && (
            <ThemeToggle />
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle>
                  <Link href="/" className="flex items-center space-x-2">
                    <Droplets className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">Qatrah Hayat</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm hover:bg-accent",
                      pathname === item.href ? "bg-accent" : ""
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t my-2" />
                {mobileAuthItems}
                <div className="border-t my-2" />
                <div className="px-4 py-3">
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
