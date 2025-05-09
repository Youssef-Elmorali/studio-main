"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Loader2, AlertCircle, Ban } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ContactPage() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Contact Us</h1>
        <p className="text-muted-foreground text-center mb-8">
          Have questions? We're here to help. Reach out to us through any of the following channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>Choose your preferred way to reach us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Office</h3>
                  <p className="text-muted-foreground">DMU SCI</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">qatrah_hayat@info.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-muted-foreground">0151413412</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?"
                    required
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Your message here..."
                    rows={4}
                    required
                    disabled
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full opacity-50 cursor-not-allowed" 
                  disabled={true}
                >
                  <Ban className="mr-2 h-4 w-4 animate-pulse" />
                  <span className="animate-pulse">Disabled</span>
                </Button>
              </form>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Contact form is currently disabled by admin for no use now
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
