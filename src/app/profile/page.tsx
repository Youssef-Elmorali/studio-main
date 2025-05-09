"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { Loader2, User, Mail, Phone, MapPin, Calendar, Droplets, HeartHandshake, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  bloodType: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
  };
  lastDonation: string;
  totalDonations: number;
  createdAt: string;
}

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "Not available";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return format(date, "MMM yyyy");
  } catch (error) {
    return "Invalid date";
  }
};

const formatDonationDate = (dateString: string | undefined | null) => {
  if (!dateString) return "Not available";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return format(date, "MMMM d, yyyy");
  } catch (error) {
    return "Invalid date";
  }
};

const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined; icon: any }) => (
  <div className="flex items-center space-x-2">
    <Icon className="w-5 h-5 text-muted-foreground" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Not provided"}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("personal");
  const [formData, setFormData] = React.useState<Partial<UserProfile>>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    bloodType: "",
    dateOfBirth: "",
    gender: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    medicalHistory: {
      conditions: [],
      allergies: [],
      medications: [],
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      console.log('Setting initial form data:', userProfile);
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        phoneNumber: userProfile.phoneNumber || "",
        address: userProfile.address || "",
        bloodType: userProfile.bloodType || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        gender: userProfile.gender || "",
        emergencyContact: {
          name: userProfile.emergencyContact?.name || "",
          phone: userProfile.emergencyContact?.phone || "",
          relationship: userProfile.emergencyContact?.relationship || "",
        },
        medicalHistory: {
          conditions: userProfile.medicalHistory?.conditions || [],
          allergies: userProfile.medicalHistory?.allergies || [],
          medications: userProfile.medicalHistory?.medications || [],
        },
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updatedData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(userRef, updatedData);

      // Refresh the user profile data
      await refreshUserProfile(user.uid);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Input changed:', { name, value });
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => {
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent as keyof UserProfile],
            [child]: value,
          },
        };
        console.log('Updated form data (nested):', newData);
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: value,
        };
        console.log('Updated form data:', newData);
        return newData;
      });
    }
  };

  // Add useEffect to monitor formData changes
  React.useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to view your profile.
              </p>
              <Button asChild>
                <a href="/auth/login">Log In</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  {userProfile?.bloodType && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      {userProfile.bloodType}
                    </Badge>
                  )}
                  {userProfile?.totalDonations > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <HeartHandshake className="h-3 w-3" />
                      {userProfile.totalDonations} Donations
                    </Badge>
                  )}
                  {userProfile?.createdAt && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Member since {formatDate(userProfile.createdAt)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="medical">Medical Info</TabsTrigger>
            <TabsTrigger value="donations">Donation History</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <div className="grid gap-6">
              {/* Read-only View */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Your current profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem 
                      label="Full Name" 
                      value={`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || undefined} 
                      icon={User} 
                    />
                    <InfoItem 
                      label="Email" 
                      value={user?.email} 
                      icon={Mail} 
                    />
                    <InfoItem 
                      label="Phone Number" 
                      value={formData.phoneNumber} 
                      icon={Phone} 
                    />
                    <InfoItem 
                      label="Address" 
                      value={formData.address} 
                      icon={MapPin} 
                    />
                    <InfoItem 
                      label="Date of Birth" 
                      value={formData.dateOfBirth ? formatDonationDate(formData.dateOfBirth) : undefined} 
                      icon={Calendar} 
                    />
                    <InfoItem 
                      label="Gender" 
                      value={formData.gender} 
                      icon={User} 
                    />
                  </div>

                  {(formData.emergencyContact?.name || formData.emergencyContact?.phone || formData.emergencyContact?.relationship) && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoItem 
                          label="Contact Name" 
                          value={formData.emergencyContact?.name} 
                          icon={User} 
                        />
                        <InfoItem 
                          label="Contact Phone" 
                          value={formData.emergencyContact?.phone} 
                          icon={Phone} 
                        />
                        <InfoItem 
                          label="Relationship" 
                          value={formData.emergencyContact?.relationship} 
                          icon={User} 
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Input
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          placeholder="Enter your gender"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact.name">Contact Name</Label>
                          <Input
                            id="emergencyContact.name"
                            name="emergencyContact.name"
                            value={formData.emergencyContact?.name}
                            onChange={handleInputChange}
                            placeholder="Enter emergency contact name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact.phone">Contact Phone</Label>
                          <Input
                            id="emergencyContact.phone"
                            name="emergencyContact.phone"
                            value={formData.emergencyContact?.phone}
                            onChange={handleInputChange}
                            placeholder="Enter emergency contact phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact.relationship">Relationship</Label>
                          <Input
                            id="emergencyContact.relationship"
                            name="emergencyContact.relationship"
                            value={formData.emergencyContact?.relationship}
                            onChange={handleInputChange}
                            placeholder="Enter relationship"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>
                  Your medical history and health information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Medical Conditions</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.medicalHistory?.conditions?.length > 0 ? (
                        formData.medicalHistory.conditions.map((condition, index) => (
                          <Badge key={index} variant="secondary">
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No medical conditions recorded</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Allergies</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.medicalHistory?.allergies?.length > 0 ? (
                        formData.medicalHistory.allergies.map((allergy, index) => (
                          <Badge key={index} variant="secondary">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No allergies recorded</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Current Medications</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.medicalHistory?.medications?.length > 0 ? (
                        formData.medicalHistory.medications.map((medication, index) => (
                          <Badge key={index} variant="secondary">
                            {medication}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No medications recorded</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Donation History</CardTitle>
                <CardDescription>
                  Your blood donation records and history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
                            <h3 className="text-2xl font-bold">{userProfile?.totalDonations || 0}</h3>
                          </div>
                          <HeartHandshake className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Last Donation</p>
                            <h3 className="text-2xl font-bold">
                              {userProfile?.lastDonation 
                                ? formatDonationDate(userProfile.lastDonation)
                                : "Never"}
                            </h3>
                          </div>
                          <Calendar className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {userProfile?.donationHistory && userProfile.donationHistory.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Recent Donations</h3>
                      <div className="space-y-2">
                        {userProfile.donationHistory.map((donation: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{formatDonationDate(donation.date)}</p>
                                  <p className="text-sm text-muted-foreground">{donation.location}</p>
                                </div>
                                <Badge variant="secondary">{donation.bloodType}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No donation history available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 