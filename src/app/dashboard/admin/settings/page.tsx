"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface SystemSettings {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  defaultUserRole: 'donor' | 'recipient';
  notificationPreferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notifyOnNewDonation: boolean;
    notifyOnNewRequest: boolean;
    notifyOnCampaignUpdate: boolean;
  };
  bloodTypes: string[];
  locations: string[];
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState<SystemSettings>({
    maintenanceMode: false,
    allowNewRegistrations: true,
    defaultUserRole: 'donor',
    notificationPreferences: {
      emailNotifications: true,
      pushNotifications: true,
      notifyOnNewDonation: true,
      notifyOnNewRequest: true,
      notifyOnCampaignUpdate: true,
    },
    bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    locations: ['City Central', 'North District', 'South District', 'East District', 'West District'],
  });

  // Fetch settings
  const fetchSettings = React.useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'system'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SystemSettings);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchSettings();
    }
  }, [authLoading, isAdmin, fetchSettings]);

  // Save settings
  const handleSaveSettings = async () => {
    if (!db) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'system'), settings);
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading settings...</p>
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
        <h1 className="text-3xl font-bold text-primary">System Settings</h1>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="blood-types">Blood Types</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to restrict access to the system.
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable new user registrations.
                  </p>
                </div>
                <Switch
                  checked={settings.allowNewRegistrations}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowNewRegistrations: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Default User Role</Label>
                <Select
                  value={settings.defaultUserRole}
                  onValueChange={(value: 'donor' | 'recipient') =>
                    setSettings({ ...settings, defaultUserRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="recipient">Recipient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system-wide notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable email notifications.
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        emailNotifications: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable push notifications.
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.pushNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        pushNotifications: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Events</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>New Donation</Label>
                    <Switch
                      checked={settings.notificationPreferences.notifyOnNewDonation}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            notifyOnNewDonation: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>New Request</Label>
                    <Switch
                      checked={settings.notificationPreferences.notifyOnNewRequest}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            notifyOnNewRequest: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Campaign Updates</Label>
                    <Switch
                      checked={settings.notificationPreferences.notifyOnCampaignUpdate}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notificationPreferences: {
                            ...settings.notificationPreferences,
                            notifyOnCampaignUpdate: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blood-types">
          <Card>
            <CardHeader>
              <CardTitle>Blood Types</CardTitle>
              <CardDescription>
                Manage available blood types in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {settings.bloodTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <span className="font-medium">{type}</span>
                    <Switch
                      checked={true}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setSettings({
                            ...settings,
                            bloodTypes: settings.bloodTypes.filter((t) => t !== type),
                          });
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Manage available locations for donations and campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.locations.map((location) => (
                  <div
                    key={location}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <span className="font-medium">{location}</span>
                    <Switch
                      checked={true}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setSettings({
                            ...settings,
                            locations: settings.locations.filter((l) => l !== location),
                          });
                        }
                      }}
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new location"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && !settings.locations.includes(value)) {
                          setSettings({
                            ...settings,
                            locations: [...settings.locations, value],
                          });
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add new location"]') as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !settings.locations.includes(value)) {
                        setSettings({
                          ...settings,
                          locations: [...settings.locations, value],
                        });
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 