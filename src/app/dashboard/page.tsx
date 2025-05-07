
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Use the Firebase auth hook
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardRedirectPage() {
    const router = useRouter();
    const { user, userProfile, loading, error: authError } = useAuth(); // Get user and profile from hook
    const [statusMessage, setStatusMessage] = React.useState("Initializing...");
    const [redirectError, setRedirectError] = React.useState<string | null>(null); // Specific error for this page

    React.useEffect(() => {
        let isMounted = true;
        console.log("DashboardRedirectPage: useEffect triggered. Auth Loading:", loading);

        if (!isMounted) return;

        if (loading) {
            setStatusMessage("Checking authentication...");
            return; // Wait for the auth hook to finish loading
        }

        if (authError) {
            console.error("DashboardRedirectPage: Auth error from hook:", authError);
            setRedirectError(authError.message || "Authentication error occurred.");
            setStatusMessage("Authentication error.");
            return;
        }

        if (!user) {
            console.log("DashboardRedirectPage: No user found. Redirecting to login.");
            setStatusMessage("Redirecting to login...");
            // Use router.replace for client-side redirect without adding to history
            router.replace('/auth/login?reason=unauthenticated_dashboard_access');
            return;
        }

        // Check if user is admin by email
        const isAdmin = user?.email?.endsWith('@admin.com'); // Adjust email pattern as needed
        
        if (isAdmin) {
            setStatusMessage("Admin detected. Redirecting...");
            console.log(`DashboardRedirectPage: Admin user detected. Redirecting...`);
            router.replace('/dashboard/admin');
        } else if (!userProfile) {
            // For non-admin users, still check profile
            console.warn(`DashboardRedirectPage: User authenticated (UID: ${user.uid}) but profile not available yet.`);
            setStatusMessage("Fetching profile data...");
            if (!authError) {
                  const profileCheckTimeout = setTimeout(() => {
                       if (isMounted && !userProfile) {
                            console.error("DashboardRedirectPage: Profile still missing after delay, possibly failed silently. Redirecting with error.");
                            setRedirectError("Failed to load user profile data after login.");
                            setStatusMessage("Profile load failed.");
                       }
                  }, 5000);
                  return () => clearTimeout(profileCheckTimeout);
            } else {
                 console.error("DashboardRedirectPage: Profile missing and authError present:", authError);
                 setRedirectError((authError as Error).message || "Failed to load user profile data.");
                 setStatusMessage("Profile load error.");
            }
        } else {
            // For non-admin users with profile
            setStatusMessage(`User role is ${userProfile.role}. Redirecting...`);
            console.log(`DashboardRedirectPage: User role is ${userProfile.role}. Redirecting...`);
            router.replace('/dashboard/user');
        }

        return () => {
             isMounted = false;
             console.log("DashboardRedirectPage: Unmounting.");
        };
    // Depend on loading state, user, userProfile, router, and authError
    }, [loading, user, userProfile, router, authError]);

    // --- Render Logic ---

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)] flex-col space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground">{statusMessage}</p>
            </div>
        );
    }

    // Handle errors encountered during the process
    const errorToShow = redirectError || authError?.message;
    if (errorToShow) {
        return (
           <div className="container mx-auto py-12 px-4 text-center">
                 <Alert variant="destructive" className="max-w-md mx-auto">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Error Loading Dashboard</AlertTitle>
                     <AlertDescription>{errorToShow}</AlertDescription>
                      <Link href="/"><Button variant="outline" className="mt-4 mr-2">Go Home</Button></Link>
                      <Link href="/auth/login"><Button className="mt-4">Try Login Again</Button></Link>
                 </Alert>
             </div>
        );
    }

    // Fallback message if redirection hasn't happened yet (should be brief)
    return (
         <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-4 text-muted-foreground">{statusMessage}</p>
         </div>
    );
}
