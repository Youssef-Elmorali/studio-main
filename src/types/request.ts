// src/types/request.ts
import type { Timestamp } from 'firebase/firestore';
import type { BloodGroup } from './user'; // Assuming BloodGroup is defined in user.ts

export type RequestStatus = 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';

export interface BloodRequest {
  id: string;
  userId: string; // ID of the user who made the request (recipient)
  requesterName?: string; // Name of the person needing blood (could be different from user)
  patientAge?: number;
  bloodGroup: BloodGroup;
  quantity: number; // e.g., units
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  hospitalName: string;
  hospitalAddress: string;
  contactPhone: string;
  status: RequestStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fulfilledBy?: string; // UID of the donor who fulfilled the request
  fulfilledDate?: Timestamp;
}

export interface Donation {
  id: string;
  donorId: string; // UID of the donor
  recipientId?: string; // UID of the recipient (if direct donation)
  requestId?: string; // ID of the blood request fulfilled (if applicable)
  donationDate: Timestamp;
  quantity: number; // units
  bloodGroup: BloodGroup;
  donationCenterName?: string;
  donationCenterAddress?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isVerified?: boolean; // Admin verified donation
}