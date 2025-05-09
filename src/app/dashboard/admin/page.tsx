"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Droplets, Target, Activity, Settings, PenSquare, Trash2, Loader2, AlertCircle, Eye, Check, Droplet as DropletIcon, HeartHandshake, Calendar, Map, Bell, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Use Firebase auth hook
import { db } from '@/lib/firebase/client'; // Import Firestore instance
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
import type { BloodRequest } from '@/types/blood-request';
import type { Campaign } from '@/types/campaign'; // Add campaign type
import { format, isValid, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { NotificationsDropdown } from '@/components/notifications-dropdown';


// --- Component ---
export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, isAdmin, loading: authLoading, error: authError } = useAuth();

  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalDonations: 0,
    totalRequests: 0,
    activeCampaigns: 0,
    pendingRequests: 0,
    recentNotifications: 0,
  });
  const [recentUsers, setRecentUsers] = React.useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = React.useState<BloodRequest[]>([]);
  const [loadingData, setLoadingData] = React.useState(true); // Start true until data is loaded or admin check fails
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [systemStatus, setSystemStatus] = React.useState({
    activeUsers: 0,
    pendingNotifications: 0,
    systemHealth: 'operational'
  });
  const [recentActivities, setRecentActivities] = React.useState<any[]>([]);

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Active donors and recipients",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      link: "/dashboard/admin/users"
    },
    {
      title: "Total Donations",
      value: stats.totalDonations,
      description: "Successful blood donations",
      icon: Droplets,
      color: "text-red-500",
      bgColor: "bg-red-100",
      link: "/dashboard/admin/donations"
    },
    {
      title: "Blood Requests",
      value: stats.totalRequests,
      description: "Active blood requests",
      icon: HeartHandshake,
      color: "text-pink-500",
      bgColor: "bg-pink-100",
      link: "/dashboard/admin/requests"
    },
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns,
      description: "Ongoing donation campaigns",
      icon: Calendar,
      color: "text-green-500",
      bgColor: "bg-green-100",
      link: "/dashboard/admin/campaigns"
    }
  ];

  // Check admin status and fetch data
  React.useEffect(() => {
    let isMounted = true;
    if (!authLoading && !user) {
        console.log("AdminDashboard: No user logged in. Redirecting.");
        if (isMounted) router.replace('/auth/login?reason=unauthorized_admin');
        if (isMounted) setLoadingData(false);
        return;
    }

     if (authLoading) {
         console.log("AdminDashboard: Auth loading, waiting...");
         if (isMounted) setLoadingData(true); // Keep loading while auth is resolving
         return;
     }

     // Handle auth errors after loading completes
     if (authError) {
        console.error("AdminDashboard: Auth error detected:", authError);
        if (isMounted) {
            setFetchError(`Authentication error: ${authError.message}`); // Use authError to display issue
            setLoadingData(false);
        }
        return;
     }

    // User is logged in, check if admin
    if (user && !isAdmin) {
        console.log("AdminDashboard: User is not admin. Redirecting.");
         if (isMounted) {
             // Redirect non-admins or show access denied message
             // For now, just stop loading and let the render logic below handle it
              setLoadingData(false); // Stop loading, render logic will show access denied
              setFetchError("Access Denied: You do not have permission to view this page."); // Set specific error
         }
        return;
    }

    // User is logged in and is an admin
    if (user && isAdmin) {
        console.log("AdminDashboard: User is admin. Fetching data...");
        if (isMounted) {
            fetchData();
            fetchSystemStatus();
            fetchRecentActivities();
        }
    }

     return () => { isMounted = false; }; // Cleanup mounted flag
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin, router, authError]); // Added authError to dependencies


    // Format date safely
    const formatDateSafe = (dateInput: Timestamp | Date | null | undefined): string => {
        if (!dateInput) return 'N/A';
        try {
            // Convert Firebase Timestamp to JS Date if necessary
            const date = dateInput instanceof Timestamp ? dateInput.toDate() : dateInput;
            // Check for valid Date object and non-NaN time
            if (date instanceof Date && !isNaN(date.getTime())) {
                 return format(date, 'PP'); // Format like 'Jul 31, 2024'
             }
             return 'Invalid Date';
        } catch (e) {
            console.error("Error formatting date:", e, "Input:", dateInput);
            return 'Invalid Date';
        }
    };

   // Fetch dashboard data (called only if isAdmin is true)
    const fetchData = React.useCallback(async () => {
        if (!db) {
             console.error("AdminDashboard: Firestore instance (db) is not available.");
             setFetchError("Database connection unavailable.");
             setLoadingData(false);
             return;
        }
        console.log("AdminDashboard: Fetching admin data from Firestore...");
        setLoadingData(true); // Ensure loading state is active
        setFetchError(null);
        try {
             // --- Fetch Users (count and recent) ---
             const usersCollectionRef = collection(db, 'users');
             const usersSnapshot = await getDocs(usersCollectionRef);
             const totalUsers = usersSnapshot.size;

             const donorsQuery = query(
                 usersCollectionRef,
                 where('role', '==', 'donor'),
                 where('isEligible', '==', true)
             );
             const donorsSnapshot = await getDocs(donorsQuery);
             const activeDonors = donorsSnapshot.size;

              const recentUsersQuery = query(
                 usersCollectionRef,
                 orderBy('createdAt', 'desc'),
                 limit(5)
             );
             const recentUsersSnapshot = await getDocs(recentUsersQuery);
             const fetchedRecentUsers = recentUsersSnapshot.docs.map(doc => ({
                  ...(doc.data() as Omit<UserProfile, 'uid'>), // Get data
                  uid: doc.id, // Use doc ID as uid
             } as UserProfile)) || [];
             setRecentUsers(fetchedRecentUsers);


             // --- Fetch Blood Requests (count and pending) ---
              const requestsCollectionRef = collection(db, 'blood_requests');
              const activeRequestStatuses: BloodRequest['status'][] = ['Pending Verification', 'Active', 'Partially Fulfilled']; // Added 'Pending Verification'
              const activeRequestsQuery = query(
                 requestsCollectionRef,
                 where('status', 'in', activeRequestStatuses)
              );
              const activeRequestsSnapshot = await getDocs(activeRequestsQuery);
              const bloodRequestsCount = activeRequestsSnapshot.size;

              const pendingStatuses: BloodRequest['status'][] = ['Pending Verification']; // Only show pending verification
              const pendingRequestsQuery = query(
                 requestsCollectionRef,
                 where('status', 'in', pendingStatuses),
                 orderBy('createdAt', 'asc'), // Show oldest pending first
                 limit(5)
              );
              const pendingRequestsSnapshot = await getDocs(pendingRequestsQuery);
               const fetchedPendingRequests = pendingRequestsSnapshot.docs.map(doc => ({
                   id: doc.id,
                   ...(doc.data() as Omit<BloodRequest, 'id' | 'createdAt' | 'updatedAt'>), // Cast data
                    // Safely convert Timestamps, default to null if invalid
                    createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : null,
                    updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : null,
               } as BloodRequest)) || []; // Ensure correct type casting
              setPendingRequests(fetchedPendingRequests);


             // --- Fetch Active Campaigns (count) ---
             let activeCampaigns = 0;
              try {
                 const campaignsCollectionRef = collection(db, 'campaigns');
                 const activeCampaignsQuery = query(campaignsCollectionRef, where('status', '==', 'Ongoing'));
                 const activeCampaignsSnapshot = await getDocs(activeCampaignsQuery);
                 activeCampaigns = activeCampaignsSnapshot.size;
              } catch (campaignError: any) {
                  console.warn("AdminDashboard: Could not fetch campaign count. Collection might not exist yet.", campaignError.message);
              }


              setStats({
                totalUsers,
                activeDonors,
                pendingRequests: bloodRequestsCount,
                upcomingCampaigns: activeCampaigns,
              });
              console.log("AdminDashboard: Firestore data fetched successfully.");

        } catch (err: any) {
          console.error("Error fetching admin dashboard data from Firestore:", err);
           setFetchError("Failed to load dashboard data. Please check Firestore rules or connection.");
        } finally {
          setLoadingData(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Removed db dependency, assuming it's stable

  // Add this inside fetchData function after other data fetching
  const fetchSystemStatus = async () => {
    try {
      // Get active users count
      const activeUsersQuery = query(
        collection(db, 'users'),
        where('lastActive', '>=', new Date(Date.now() - 5 * 60 * 1000)) // Users active in last 5 minutes
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      
      // Get pending notifications count
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('read', '==', false)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);

      setSystemStatus({
        activeUsers: activeUsersSnapshot.size,
        pendingNotifications: notificationsSnapshot.size,
        systemHealth: 'operational'
      });
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent blood requests
      const recentRequestsQuery = query(
        collection(db, 'blood_requests'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const requestsSnapshot = await getDocs(recentRequestsQuery);
      
      // Fetch recent donations
      const recentDonationsQuery = query(
        collection(db, 'donations'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const donationsSnapshot = await getDocs(recentDonationsQuery);

      // Combine and sort activities
      const activities = [
        ...requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'request',
          title: 'New Blood Request',
          description: `${doc.data().bloodType} blood type requested`,
          time: formatDistanceToNow(doc.data().createdAt.toDate(), { addSuffix: true }),
          createdAt: doc.data().createdAt
        })),
        ...donationsSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'donation',
          title: 'Donation Completed',
          description: `${doc.data().bloodType} blood type donated`,
          time: formatDistanceToNow(doc.data().createdAt.toDate(), { addSuffix: true }),
          createdAt: doc.data().createdAt
        }))
      ].sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
       .slice(0, 3);

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  // --- Action Handlers ---
  const handleApproveRequest = async (requestId: string) => {
       if (!db || !requestId) return;
       setActionLoading(`approve-${requestId}`);
       try {
           const requestDocRef = doc(db, 'blood_requests', requestId);
           await updateDoc(requestDocRef, {
               status: 'Active',
               updatedAt: serverTimestamp() // Use server timestamp
           });
           toast({ title: "Request Approved", description: "The blood request is now active." });
           fetchData(); // Refresh data
       } catch (err: any) {
           console.error("Error approving request:", err);
           toast({ title: "Approval Failed", description: err.message || "Could not approve the request.", variant: "destructive" });
       } finally {
           setActionLoading(null);
       }
   };

   const handleRejectRequest = async (requestId: string) => {
      if (!db || !requestId) return;
      setActionLoading(`reject-${requestId}`);
      try {
           const requestDocRef = doc(db, 'blood_requests', requestId);
            await updateDoc(requestDocRef, {
                status: 'Cancelled', // Or 'Rejected' if you add that status
                updatedAt: serverTimestamp() // Use server timestamp
            });
          toast({ title: "Request Rejected", description: "The blood request has been cancelled." });
          fetchData(); // Refresh data
      } catch (err: any) {
          console.error("Error rejecting request:", err);
          toast({ title: "Rejection Failed", description: err.message || "Could not reject the request.", variant: "destructive" });
      } finally {
           setActionLoading(null);
      }
   };

   const handleDeleteUser = async (userId: string) => {
        if (!db || !userId) return;
        setActionLoading(`delete-user-${userId}`);
        console.warn("Attempting to delete user profile and related data from Firestore. Auth record deletion requires Admin SDK (run server-side).");

        // TODO: Implement more robust deletion, potentially using Cloud Functions
        // This example only deletes the user profile document.
        // Consider deleting related requests, donations, etc. in a transaction or function.

        try {
            const userDocRef = doc(db, 'users', userId);
            await deleteDoc(userDocRef);

            // Placeholder: Ideally trigger a Cloud Function to delete Auth user and other related data
            // await callCloudFunctionToDeleteUser(userId);

            toast({ title: "User Profile Deleted", description: "Profile removed from Firestore. Auth record needs separate deletion (Admin SDK)." });
            fetchData(); // Refresh data
        } catch (err: any) {
            console.error("Error deleting user profile:", err);
            toast({ title: "Profile Deletion Failed", description: err.message || "Could not delete user profile.", variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
   }

  // --- Render Logic ---
  if (authLoading || loadingData) { // Show loading if either auth or data is loading
    const message = authLoading ? "Checking permissions..." : "Loading admin data...";
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="ml-4 text-muted-foreground">{message}</p>
      </div>
    );
  }

    // Handle auth errors or access denied errors specifically
     if (fetchError) {
         return (
             <div className="container mx-auto py-12 px-4 text-center">
                 <Alert variant="destructive" className="max-w-md mx-auto">
                     <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{fetchError.startsWith("Access Denied") ? "Access Denied" : "Error"}</AlertTitle>
                     <AlertDescription>{fetchError}</AlertDescription>
                      <div className="mt-4 space-x-2">
                         {fetchError.startsWith("Access Denied") ? (
                              <Link href="/dashboard"><Button variant="outline">Go to User Dashboard</Button></Link>
                         ) : (
                              <Button onClick={fetchData} variant="secondary" disabled={!db}>Retry</Button>
                         )}
                         <Link href="/"><Button variant="outline">Go Home</Button></Link>
                          {authError && <Link href="/auth/login"><Button>Login Again</Button></Link>}
                     </div>
                 </Alert>
             </div>
         );
     }


  // Render actual admin dashboard content only if admin and no errors
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.displayName || 'Admin'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <Button onClick={() => router.push('/dashboard/admin/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => router.push(stat.link)}
              >
                View Details
              </Button>
          </CardContent>
        </Card>
        ))}
      </div>

      {/* Recent Activities and System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
             <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
             </CardHeader>
             <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'request' ? 'bg-red-100' :
                      activity.type === 'donation' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      {activity.type === 'request' ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : activity.type === 'donation' ? (
                        <Droplets className="h-4 w-4 text-green-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
                 ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activities
                </div>
              )}
                 </div>
             </CardContent>
          </Card>

        <Card>
             <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and metrics</CardDescription>
             </CardHeader>
             <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${
                    systemStatus.systemHealth === 'operational' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Activity className={`h-4 w-4 ${
                      systemStatus.systemHealth === 'operational' ? 'text-green-500' : 'text-red-500'
                    }`} />
                  </div>
                  <span>System Status</span>
                </div>
                <span className={`text-sm ${
                  systemStatus.systemHealth === 'operational' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {systemStatus.systemHealth === 'operational' ? 'All Systems Operational' : 'System Issues Detected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <span>Active Users</span>
                </div>
                <span className="text-sm">{systemStatus.activeUsers} online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Bell className="h-4 w-4 text-purple-500" />
                  </div>
                  <span>Pending Notifications</span>
                </div>
                <span className="text-sm">{systemStatus.pendingNotifications} unread</span>
              </div>
                 </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/admin/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Settings
                  </Button>
             </CardContent>
           </Card>
       </div>
    </div>
  );
}
