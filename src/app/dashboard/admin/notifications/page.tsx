"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Search, Filter, Loader2, AlertCircle, Eye, Plus, Trash2, Check, X } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp, addDoc } from 'firebase/firestore';
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'donors' | 'recipients' | 'admins';
  status: 'active' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [targetFilter, setTargetFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newNotification, setNewNotification] = React.useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
  });

  // Fetch notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const notificationsCollectionRef = collection(db, 'notifications');
      const notificationsQuery = query(
        notificationsCollectionRef,
        orderBy('createdAt', 'desc')
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const fetchedNotifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      setNotifications(fetchedNotifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchNotifications();
    }
  }, [authLoading, isAdmin, fetchNotifications]);

  // Filter notifications based on search query and filters
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesTarget = targetFilter === 'all' || notification.target === targetFilter;
      const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
      
      return matchesSearch && matchesType && matchesTarget && matchesStatus;
    });
  }, [notifications, searchQuery, typeFilter, targetFilter, statusFilter]);

  // Handle notification creation
  const handleCreateNotification = async () => {
    if (!db) return;
    setActionLoading('create');
    try {
      const notificationsCollectionRef = collection(db, 'notifications');
      await addDoc(notificationsCollectionRef, {
        ...newNotification,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Notification Created",
        description: "New notification has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
      });
      fetchNotifications();
    } catch (error: any) {
      console.error("Error creating notification:", error);
      toast({
        title: "Error",
        description: "Failed to create notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle notification deletion
  const handleDeleteNotification = async (notificationId: string) => {
    if (!db) return;
    setActionLoading(`delete-${notificationId}`);
    try {
      const notificationDocRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationDocRef);
      toast({
        title: "Notification Deleted",
        description: "Notification has been deleted successfully.",
      });
      fetchNotifications();
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle status change
  const handleStatusChange = async (notificationId: string, newStatus: string) => {
    if (!db) return;
    setActionLoading(`status-${notificationId}`);
    try {
      const notificationDocRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Status Updated",
        description: "Notification status has been updated successfully.",
      });
      fetchNotifications();
    } catch (error: any) {
      console.error("Error updating notification status:", error);
      toast({
        title: "Error",
        description: "Failed to update notification status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading notifications...</p>
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
        <h1 className="text-3xl font-bold text-primary">Notification Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                Create a new notification to send to users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) => setNewNotification({ ...newNotification, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Target Audience</Label>
                <Select
                  value={newNotification.target}
                  onValueChange={(value) => setNewNotification({ ...newNotification, target: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="donors">Donors Only</SelectItem>
                    <SelectItem value="recipients">Recipients Only</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNotification} disabled={actionLoading === 'create'}>
                {actionLoading === 'create' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Notification'
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
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="donors">Donors</SelectItem>
                <SelectItem value="recipients">Recipients</SelectItem>
                <SelectItem value="admins">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage system notifications and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">
                      {notification.title}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {notification.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(notification.type)}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {notification.target.charAt(0).toUpperCase() + notification.target.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={notification.status}
                        onValueChange={(value) => handleStatusChange(notification.id, value)}
                        disabled={actionLoading === `status-${notification.id}`}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {notification.createdAt ? format(notification.createdAt.toDate(), 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={actionLoading === `delete-${notification.id}`}
                          >
                            {actionLoading === `delete-${notification.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete Notification</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this notification? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No notifications found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 