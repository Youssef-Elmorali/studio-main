"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, Loader2, AlertCircle, Eye, Check, X, Shield, UserPlus } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
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

export default function UsersPage() {
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const usersCollectionRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollectionRef);
      const fetchedUsers = usersSnapshot.docs.map(doc => ({
        ...(doc.data() as Omit<UserProfile, 'uid'>),
        uid: doc.id,
      } as UserProfile));
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin, fetchUsers]);

  // Filter users based on search query and role filter
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!db) return;
    setActionLoading(`role-${userId}`);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!db) return;
    setActionLoading(`delete-${userId}`);
    try {
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle eligibility toggle
  const handleToggleEligibility = async (userId: string, currentEligibility: boolean) => {
    if (!db) return;
    setActionLoading(`eligibility-${userId}`);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isEligible: !currentEligibility,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Eligibility Updated",
        description: `User is now ${!currentEligibility ? 'eligible' : 'ineligible'} to donate.`,
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating eligibility:", error);
      toast({
        title: "Error",
        description: "Failed to update eligibility. Please try again.",
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
        <p className="ml-4 text-muted-foreground">Loading users...</p>
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
        <h1 className="text-3xl font-bold text-primary">User Management</h1>
        <Button variant="outline" size="sm" disabled>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="donor">Donor</SelectItem>
                <SelectItem value="recipient">Recipient</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and eligibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.uid, value)}
                        disabled={actionLoading === `role-${user.uid}`}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="donor">Donor</SelectItem>
                          <SelectItem value="recipient">Recipient</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isEligible ? "success" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleEligibility(user.uid, user.isEligible)}
                      >
                        {user.isEligible ? "Eligible" : "Ineligible"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? format(user.createdAt.toDate(), 'PP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={actionLoading === `view-${user.uid}`}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View User</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={actionLoading === `delete-${user.uid}`}
                          >
                            {actionLoading === `delete-${user.uid}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete User</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.uid)}
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
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 