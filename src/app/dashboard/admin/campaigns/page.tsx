"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Search, Filter, Loader2, AlertCircle, Eye, Plus, Calendar, MapPin } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Campaign {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  targetUnits: number;
  collectedUnits: number;
  organizer: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function CampaignsPage() {
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newCampaign, setNewCampaign] = React.useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    targetUnits: 0,
    organizer: '',
  });

  // Fetch campaigns
  const fetchCampaigns = React.useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const campaignsCollectionRef = collection(db, 'campaigns');
      const campaignsSnapshot = await getDocs(campaignsCollectionRef);
      const fetchedCampaigns = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Campaign));
      setCampaigns(fetchedCampaigns);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchCampaigns();
    }
  }, [authLoading, isAdmin, fetchCampaigns]);

  // Filter campaigns based on search query and status filter
  const filteredCampaigns = React.useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = 
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  // Handle status change
  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    if (!db) return;
    setActionLoading(`status-${campaignId}`);
    try {
      const campaignDocRef = doc(db, 'campaigns', campaignId);
      await updateDoc(campaignDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Status Updated",
        description: "Campaign status has been updated successfully.",
      });
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error updating campaign status:", error);
      toast({
        title: "Error",
        description: "Failed to update campaign status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    if (!db) return;
    setActionLoading('create');
    try {
      const campaignsCollectionRef = collection(db, 'campaigns');
      await addDoc(campaignsCollectionRef, {
        ...newCampaign,
        status: 'upcoming',
        collectedUnits: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Campaign Created",
        description: "New campaign has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewCampaign({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        targetUnits: 0,
        organizer: '',
      });
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
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
        <p className="ml-4 text-muted-foreground">Loading campaigns...</p>
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
        <h1 className="text-3xl font-bold text-primary">Campaign Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Fill in the details for the new blood donation campaign.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newCampaign.location}
                  onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetUnits">Target Units</Label>
                <Input
                  id="targetUnits"
                  type="number"
                  value={newCampaign.targetUnits}
                  onChange={(e) => setNewCampaign({ ...newCampaign, targetUnits: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="organizer">Organizer</Label>
                <Input
                  id="organizer"
                  value={newCampaign.organizer}
                  onChange={(e) => setNewCampaign({ ...newCampaign, organizer: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={actionLoading === 'create'}>
                {actionLoading === 'create' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns..."
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
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>
            Manage blood donation campaigns and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {campaign.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {format(campaign.startDate.toDate(), 'PP')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          to {format(campaign.endDate.toDate(), 'PP')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{
                              width: `${(campaign.collectedUnits / campaign.targetUnits) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {campaign.collectedUnits}/{campaign.targetUnits}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.status}
                        onValueChange={(value) => handleStatusChange(campaign.id, value)}
                        disabled={actionLoading === `status-${campaign.id}`}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{campaign.organizer}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={actionLoading === `view-${campaign.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Campaign</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 