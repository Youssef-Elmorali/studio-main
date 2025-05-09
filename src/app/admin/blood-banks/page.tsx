"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from "firebase/firestore";
import { Loader2, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BloodBank {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bloodTypes: string[];
  isEmergency: boolean;
  isActive: boolean;
  lastUpdated: Date;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodBanksAdminPage() {
  const [bloodBanks, setBloodBanks] = React.useState<BloodBank[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingBank, setEditingBank] = React.useState<BloodBank | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  // Fetch blood banks
  const fetchBloodBanks = async () => {
    if (!db) return;
    
    setLoading(true);
    try {
      const bloodBanksRef = collection(db, "blood_banks");
      const q = query(bloodBanksRef, orderBy("name"));
      const snapshot = await getDocs(q);
      const banks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
      })) as BloodBank[];
      
      setBloodBanks(banks);
    } catch (error) {
      console.error("Error fetching blood banks:", error);
      toast({
        title: "Error",
        description: "Failed to load blood banks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBloodBanks();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBank) return;

    try {
      const bankData = {
        ...editingBank,
        lastUpdated: new Date(),
      };

      if (editingBank.id) {
        // Update existing bank
        await updateDoc(doc(db, "blood_banks", editingBank.id), bankData);
        toast({
          title: "Success",
          description: "Blood bank updated successfully.",
        });
      } else {
        // Add new bank
        await addDoc(collection(db, "blood_banks"), bankData);
        toast({
          title: "Success",
          description: "Blood bank added successfully.",
        });
      }

      setIsDialogOpen(false);
      setEditingBank(null);
      fetchBloodBanks();
    } catch (error) {
      console.error("Error saving blood bank:", error);
      toast({
        title: "Error",
        description: "Failed to save blood bank.",
        variant: "destructive",
      });
    }
  };

  // Handle bank deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blood bank?")) return;

    try {
      await deleteDoc(doc(db, "blood_banks", id));
      toast({
        title: "Success",
        description: "Blood bank deleted successfully.",
      });
      fetchBloodBanks();
    } catch (error) {
      console.error("Error deleting blood bank:", error);
      toast({
        title: "Error",
        description: "Failed to delete blood bank.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Blood Banks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBank({
              id: "",
              name: "",
              address: "",
              city: "",
              phone: "",
              hours: "",
              coordinates: { lat: 0, lng: 0 },
              bloodTypes: [],
              isEmergency: false,
              isActive: true,
              lastUpdated: new Date()
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Blood Bank
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingBank?.id ? "Edit Blood Bank" : "Add Blood Bank"}</DialogTitle>
              <DialogDescription>
                {editingBank?.id ? "Update the blood bank information below." : "Fill in the blood bank information below."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingBank?.name || ""}
                    onChange={(e) => setEditingBank(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editingBank?.city || ""}
                    onChange={(e) => setEditingBank(prev => prev ? { ...prev, city: e.target.value } : null)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editingBank?.address || ""}
                  onChange={(e) => setEditingBank(prev => prev ? { ...prev, address: e.target.value } : null)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editingBank?.phone || ""}
                    onChange={(e) => setEditingBank(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Operating Hours</Label>
                  <Input
                    id="hours"
                    value={editingBank?.hours || ""}
                    onChange={(e) => setEditingBank(prev => prev ? { ...prev, hours: e.target.value } : null)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={editingBank?.coordinates.lat || ""}
                    onChange={(e) => setEditingBank(prev => prev ? {
                      ...prev,
                      coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) }
                    } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={editingBank?.coordinates.lng || ""}
                    onChange={(e) => setEditingBank(prev => prev ? {
                      ...prev,
                      coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) }
                    } : null)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Available Blood Types</Label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type}
                        checked={editingBank?.bloodTypes.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...(editingBank?.bloodTypes || []), type]
                            : (editingBank?.bloodTypes || []).filter(t => t !== type);
                          setEditingBank(prev => prev ? { ...prev, bloodTypes: newTypes } : null);
                        }}
                      />
                      <Label htmlFor={type}>{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="emergency"
                  checked={editingBank?.isEmergency}
                  onCheckedChange={(checked) => setEditingBank(prev => prev ? { ...prev, isEmergency: checked } : null)}
                />
                <Label htmlFor="emergency">24/7 Emergency Service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingBank?.isActive}
                  onCheckedChange={(checked) => setEditingBank(prev => prev ? { ...prev, isActive: checked } : null)}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingBank?.id ? "Update" : "Add"} Blood Bank
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading blood banks...</span>
        </div>
      ) : (
        <div className="grid gap-6">
          {bloodBanks.map((bank) => (
            <Card key={bank.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{bank.name}</CardTitle>
                    <CardDescription>{bank.address}, {bank.city}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBank(bank);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(bank.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Contact Information</p>
                    <p className="text-sm text-muted-foreground">Phone: {bank.phone}</p>
                    <p className="text-sm text-muted-foreground">Hours: {bank.hours}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      Emergency Service: {bank.isEmergency ? "Yes" : "No"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Active: {bank.isActive ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium">Available Blood Types</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {bank.bloodTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 