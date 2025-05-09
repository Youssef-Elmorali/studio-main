"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface UrgentNeed {
  id: string;
  bloodType: string;
  location: string;
  urgency: 'Critical' | 'High' | 'Medium';
  createdAt: Date;
  updatedAt: Date;
}

export default function UrgentNeedsPage() {
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [urgentNeeds, setUrgentNeeds] = React.useState<UrgentNeed[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingNeed, setEditingNeed] = React.useState<UrgentNeed | null>(null);
  const [formData, setFormData] = React.useState({
    bloodType: '',
    location: '',
    urgency: 'High'
  });

  // Fetch urgent needs
  const fetchUrgentNeeds = React.useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const needsRef = collection(db, 'urgent_needs');
      const q = query(needsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedNeeds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as UrgentNeed));
      setUrgentNeeds(fetchedNeeds);
    } catch (error: any) {
      console.error("Error fetching urgent needs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch urgent needs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUrgentNeeds();
    }
  }, [authLoading, isAdmin, fetchUrgentNeeds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    try {
      const needData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingNeed) {
        await updateDoc(doc(db, 'urgent_needs', editingNeed.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast({
          title: "Success",
          description: "Urgent need updated successfully.",
        });
      } else {
        await addDoc(collection(db, 'urgent_needs'), needData);
        toast({
          title: "Success",
          description: "New urgent need added successfully.",
        });
      }

      setIsDialogOpen(false);
      setEditingNeed(null);
      setFormData({ bloodType: '', location: '', urgency: 'High' });
      fetchUrgentNeeds();
    } catch (error: any) {
      console.error("Error saving urgent need:", error);
      toast({
        title: "Error",
        description: "Failed to save urgent need. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'urgent_needs', id));
      toast({
        title: "Success",
        description: "Urgent need deleted successfully.",
      });
      fetchUrgentNeeds();
    } catch (error: any) {
      console.error("Error deleting urgent need:", error);
      toast({
        title: "Error",
        description: "Failed to delete urgent need. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (need: UrgentNeed) => {
    setEditingNeed(need);
    setFormData({
      bloodType: need.bloodType,
      location: need.location,
      urgency: need.urgency
    });
    setIsDialogOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading urgent needs...</p>
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
        <h1 className="text-3xl font-bold text-primary">Urgent Needs Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Urgent Need
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingNeed ? 'Edit Urgent Need' : 'Add New Urgent Need'}</DialogTitle>
              <DialogDescription>
                {editingNeed ? 'Update the urgent need details below.' : 'Fill in the details for the new urgent need.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input
                  id="bloodType"
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  placeholder="e.g., O-, A+, B-"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Downtown General Hospital"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value as 'Critical' | 'High' | 'Medium' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingNeed ? 'Update' : 'Add'} Urgent Need
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Urgent Needs</CardTitle>
          <CardDescription>
            Manage urgent blood needs and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {urgentNeeds.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urgentNeeds.map((need) => (
                  <TableRow key={need.id}>
                    <TableCell className="font-medium">{need.bloodType}</TableCell>
                    <TableCell>{need.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          need.urgency === 'Critical'
                            ? 'destructive'
                            : need.urgency === 'High'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {need.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {need.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(need)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(need.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No urgent needs found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 