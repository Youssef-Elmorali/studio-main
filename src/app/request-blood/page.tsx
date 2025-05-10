"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Loader2, AlertCircle, CheckCircle2, FileText, Search, MapPin, Phone, Clock, Navigation } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapView } from "@/components/map-view";
import Link from "next/link";
import type { BloodBank } from "@/types/blood-bank";
import { BloodCompatibilityChart } from "@/components/blood-compatibility-chart";

interface BloodRequest {
  id: string;
  patientName: string;
  bloodType: string;
  units: number;
  urgency: string;
  hospital: string;
  contactName: string;
  contactPhone: string;
  additionalNotes: string;
  status: string;
  createdAt: Date;
  operationNumber: string;
  userId: string;
  updatedAt: Timestamp;
}

export default function RequestBloodPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [receiptData, setReceiptData] = React.useState<BloodRequest | null>(null);
  const [formData, setFormData] = React.useState({
    patientName: "",
    bloodType: "",
    units: "",
    urgency: "",
    hospital: "",
    contactName: "",
    contactPhone: "",
    additionalNotes: "",
  });

  const generateOperationNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REQ-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request blood.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const operationNumber = generateOperationNumber();
      const requestData = {
        patientName: formData.patientName,
        bloodType: formData.bloodType,
        units: parseInt(formData.units),
        urgency: formData.urgency.toLowerCase(),
        hospital: formData.hospital,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        additionalNotes: formData.additionalNotes,
        userId: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        operationNumber,
      };

      const docRef = await addDoc(collection(db, "blood_requests"), requestData);
      
      // Create receipt data
      const receipt: BloodRequest = {
        id: docRef.id,
        patientName: formData.patientName,
        bloodType: formData.bloodType,
        units: parseInt(formData.units),
        urgency: formData.urgency.toLowerCase(),
        hospital: formData.hospital,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        additionalNotes: formData.additionalNotes,
        userId: user.uid,
        status: "pending",
        createdAt: new Date(),
        updatedAt: serverTimestamp() as Timestamp,
        operationNumber,
      };
      
      setReceiptData(receipt);
      setShowReceipt(true);
      
      toast({
        title: "Request Submitted",
        description: "Your blood request has been submitted successfully.",
      });

      // Reset form
      setFormData({
        patientName: "",
        bloodType: "",
        units: "",
        urgency: "",
        hospital: "",
        contactName: "",
        contactPhone: "",
        additionalNotes: "",
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Request Blood</CardTitle>
            <CardDescription>
              Fill out the form below to request blood. Our team will review your request and get back to you shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient's Name</Label>
                  <Input
                    id="patientName"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    placeholder="Enter patient's name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type Required</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => handleSelectChange("bloodType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units Required</Label>
                  <Input
                    id="units"
                    name="units"
                    type="number"
                    min="1"
                    value={formData.units}
                    onChange={handleInputChange}
                    placeholder="Number of units"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => handleSelectChange("urgency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital Name</Label>
                  <Input
                    id="hospital"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    placeholder="Enter hospital name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Enter contact name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="Enter contact phone"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Any additional information that might help"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Receipt</DialogTitle>
            <DialogDescription>
              Your blood request has been submitted successfully. Please save this receipt for future reference.
            </DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Operation Number:</span>
                  <span className="font-bold">{receiptData.operationNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Patient Name:</span>
                    <p className="font-medium">{receiptData.patientName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blood Type:</span>
                    <p className="font-medium">{receiptData.bloodType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Units:</span>
                    <p className="font-medium">{receiptData.units}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Urgency:</span>
                    <p className="font-medium capitalize">{receiptData.urgency}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">{receiptData.status}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Hospital:</span>
                    <p className="font-medium">{receiptData.hospital}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Contact:</span>
                    <p className="font-medium">{receiptData.contactName} - {receiptData.contactPhone}</p>
                  </div>
                  {receiptData.additionalNotes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Additional Notes:</span>
                      <p className="font-medium">{receiptData.additionalNotes}</p>
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

      {/* Add Blood Type Compatibility Chart */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Blood Type Compatibility</CardTitle>
          <CardDescription className="text-center">
            Understanding blood type compatibility is crucial for safe transfusions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BloodCompatibilityChart />
        </CardContent>
      </Card>
    </div>
  );
} 