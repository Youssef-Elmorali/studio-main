"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeartHandshake, Search, Filter, Loader2, AlertCircle, Eye, Check, X, Calendar, CheckCircle2, FileText } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface BloodRequest {
  id: string;
  patientName: string;
  bloodType: string;
  units: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  hospital: string;
  contactName: string;
  contactPhone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  operationNumber: string;
  userId: string;
  additionalNotes: string;
}

export default function RequestsPage() {
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [requests, setRequests] = React.useState<BloodRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = React.useState<string>('all');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = React.useState<BloodRequest | null>(null);
  const [showReceipt, setShowReceipt] = React.useState(false);

  // Fetch requests
  const fetchRequests = React.useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const requestsCollectionRef = collection(db, 'blood_requests');
      const requestsSnapshot = await getDocs(requestsCollectionRef);
      const fetchedRequests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BloodRequest));
      setRequests(fetchedRequests);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchRequests();
    }
  }, [authLoading, isAdmin, fetchRequests]);

  // Filter requests based on search query and filters
  const filteredRequests = React.useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = searchQuery === '' || (
        (request.patientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (request.bloodType?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (request.hospital?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
      
      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }, [requests, searchQuery, statusFilter, urgencyFilter]);

  // Handle status change
  const handleStatusChange = async (requestId: string, newStatus: string) => {
    if (!db) return;
    setActionLoading(`status-${requestId}`);
    try {
      const requestDocRef = doc(db, 'blood_requests', requestId);
      await updateDoc(requestDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Status Updated",
        description: "Request status has been updated successfully.",
      });
      fetchRequests();
    } catch (error: any) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Get urgency badge variant
  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!db) return;
    setActionLoading(requestId);
    try {
      await updateDoc(doc(db, "blood_requests", requestId), {
        status: "Active",
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Request Approved",
        description: "The blood request has been approved.",
      });
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!db) return;
    setActionLoading(requestId);
    try {
      await updateDoc(doc(db, "blood_requests", requestId), {
        status: "Rejected",
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Request Rejected",
        description: "The blood request has been rejected.",
      });
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Verification":
        return "bg-yellow-100 text-yellow-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading requests...</p>
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
        <h1 className="text-3xl font-bold text-primary">Blood Request Management</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Requests</CardTitle>
          <CardDescription>
            Manage blood requests and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.patientName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{request.bloodType}</Badge>
                    </TableCell>
                    <TableCell>{request.units}</TableCell>
                    <TableCell>{request.hospital}</TableCell>
                    <TableCell>
                      <Badge variant={getUrgencyBadgeVariant(request.urgency)}>
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.createdAt ? format(request.createdAt.toDate(), 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={actionLoading === `view-${request.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Request</span>
                      </Button>
                      {request.status === "Pending Verification" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading === `approve-${request.id}`}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Approve Request</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReject(request.id)}
                            disabled={actionLoading === `reject-${request.id}`}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Reject Request</span>
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No requests found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              View the complete details of this blood request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Operation Number:</span>
                  <span className="font-bold">{selectedRequest.operationNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Blood Type:</span>
                    <p className="font-medium">{selectedRequest.bloodType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Units:</span>
                    <p className="font-medium">{selectedRequest.units}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Urgency:</span>
                    <p className="font-medium capitalize">{selectedRequest.urgency}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">{selectedRequest.status}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Hospital:</span>
                    <p className="font-medium">{selectedRequest.hospital}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Contact:</span>
                    <p className="font-medium">{selectedRequest.contactName} - {selectedRequest.contactPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{selectedRequest.createdAt.toLocaleString()}</p>
                  </div>
                  {selectedRequest.additionalNotes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Additional Notes:</span>
                      <p className="font-medium">{selectedRequest.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReceipt(false)}>
                  Close
                </Button>
                <Button onClick={() => window.print()}>
                  <FileText className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 