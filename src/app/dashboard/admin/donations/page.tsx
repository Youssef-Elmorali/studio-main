"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Search, Filter, Loader2, AlertCircle, Eye, Check, X, Calendar } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
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

interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  bloodType: string;
  units: number;
  status: 'pending' | 'completed' | 'cancelled';
  location: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function DonationsPage() {
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [donations, setDonations] = React.useState<Donation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Fetch donations
  const fetchDonations = React.useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const donationsCollectionRef = collection(db, 'donations');
      const donationsSnapshot = await getDocs(donationsCollectionRef);
      const fetchedDonations = donationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Donation));
      setDonations(fetchedDonations);
    } catch (error: any) {
      console.error("Error fetching donations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch donations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchDonations();
    }
  }, [authLoading, isAdmin, fetchDonations]);

  // Filter donations based on search query and status filter
  const filteredDonations = React.useMemo(() => {
    return donations.filter(donation => {
      const matchesSearch = 
        donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [donations, searchQuery, statusFilter]);

  // Handle status change
  const handleStatusChange = async (donationId: string, newStatus: string) => {
    if (!db) return;
    setActionLoading(`status-${donationId}`);
    try {
      const donationDocRef = doc(db, 'donations', donationId);
      await updateDoc(donationDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Status Updated",
        description: "Donation status has been updated successfully.",
      });
      fetchDonations();
    } catch (error: any) {
      console.error("Error updating donation status:", error);
      toast({
        title: "Error",
        description: "Failed to update donation status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading donations...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Donation Management</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search donations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Donations</CardTitle>
          <CardDescription>
            Manage blood donations and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDonations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">
                      {donation.donorName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{donation.bloodType}</Badge>
                    </TableCell>
                    <TableCell>{donation.units}</TableCell>
                    <TableCell>{donation.location}</TableCell>
                    <TableCell>
                      <Select
                        value={donation.status}
                        onValueChange={(value) => handleStatusChange(donation.id, value)}
                        disabled={actionLoading === `status-${donation.id}`}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {donation.createdAt ? format(donation.createdAt.toDate(), 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={actionLoading === `view-${donation.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Donation</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No donations found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 