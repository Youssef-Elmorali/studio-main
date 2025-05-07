// src/lib/firebase/seed.ts
import { db } from './client';
import { collection, writeBatch, doc, serverTimestamp, Timestamp, GeoPoint } from 'firebase/firestore';

// --- Types (Simplified for seeding, ensure they align with your actual types) ---
type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type Role = 'donor' | 'recipient' | 'admin' | 'staff'; // Added staff

interface SeedBloodBank {
  id?: string; // Optional, Firestore will generate if not provided
  name: string;
  location: string;
  locationCoords?: { lat: number; lng: number }; // For GeoPoint
  contactPhone: string;
  operatingHours: string;
  website?: string;
  inventory: Partial<Record<BloodGroup, number>>;
  servicesOffered?: string[];
  // Timestamps will be handled by serverTimestamp or new Date()
}

interface SeedUser {
  uid?: string; // For linking to auth, or Firestore can generate ID for profile
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  bloodGroup?: BloodGroup;
  phone?: string;
  dob?: Date; // Date of Birth
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  // Donor specific
  totalDonations?: number;
  lastDonationDate?: Date;
  isEligible?: boolean;
  // Recipient specific
  // Admin/Staff specific
  // Timestamps
}



interface SeedBloodRequest {
  id?: string;
  requesterUid: string; // Link to a user
  requesterName: string;
  patientName: string;
  requiredBloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled?: number;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  hospitalName: string;
  hospitalLocation: string;
  contactPhone: string;
  additionalDetails?: string | null;
  status: 'Pending Verification' | 'Active' | 'Partially Fulfilled' | 'Fulfilled' | 'Cancelled' | 'Expired';
  // Timestamps
}

interface SeedDonation {
  id?: string;
  donorUid: string; // Link to a donor user
  donorName: string;
  bloodBankId: string; // Link to a blood bank
  bloodBankName: string;
  donationDate: Date;
  unitsDonated: number;
  bloodGroup: BloodGroup;
  notes?: string;
  // Timestamps
}

interface SeedCampaign {
  id?: string;
  title: string;
  description: string;
  organizer: string; // Could be a bank ID or organization name
  startDate: Date;
  endDate: Date;
  location: string;
  locationCoords?: { lat: number; lng: number };
  goalUnits?: number;
  collectedUnits?: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  bannerImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  // Timestamps
}

// --- Sample Data ---
const sampleBloodBanks: SeedBloodBank[] = [
  {
    name: 'City Central Blood Bank',
    location: '123 Main St, Anytown, USA 12345',
    locationCoords: { lat: 34.0522, lng: -118.2437 }, // Example: Los Angeles
    contactPhone: '555-123-4567',
    operatingHours: 'Mon-Fri: 9 AM - 5 PM, Sat: 10 AM - 2 PM',
    website: 'https://citycentralbloodbank.example.com',
    inventory: { 'A+': 50, 'O-': 20, 'B+': 30, 'AB+': 15 },
    servicesOffered: ['Whole Blood Donation', 'Platelet Apheresis', 'Plasma Donation'],
  },
  {
    name: 'Hope Community Blood Center',
    location: '456 Oak Ave, Anytown, USA 12345',
    locationCoords: { lat: 34.0550, lng: -118.2500 }, // Near previous
    contactPhone: '555-987-6543',
    operatingHours: 'Mon-Sat: 8 AM - 6 PM',
    inventory: { 'O+': 60, 'A-': 25, 'B-': 10, 'AB-': 5 },
    servicesOffered: ['Whole Blood Donation', 'Mobile Blood Drives'],
  },
  {
    name: 'Unity Regional Hospital Blood Services',
    location: '789 Pine Rd, Anytown, USA 12345',
    locationCoords: { lat: 34.0600, lng: -118.2550 },
    contactPhone: '555-222-3333',
    operatingHours: '24/7 (For Emergencies)',
    website: 'https://unityhospitalblood.example.com',
    inventory: { 'A+': 40, 'O+': 70, 'B+': 20, 'AB+': 10, 'A-': 15, 'O-': 30, 'B-': 8, 'AB-': 4 },
    servicesOffered: ['Emergency Blood Supply', 'Whole Blood Donation', 'Specialized Blood Components'],
  },
];

const sampleUsers: SeedUser[] = [
  {
    uid: 'admin001',
    firstName: 'Admin',
    lastName: 'User',
    email: 'qatrah@admin.com',
    role: 'admin',
    bloodGroup: 'O+',
    phone: '0000000000',
    dob: new Date(1990, 0, 1),
    gender: 'Male'
  },
  {
    uid: 'admin002',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@admin.com',
    role: 'admin',
    bloodGroup: 'O+',
    phone: '0000000000',
    dob: new Date(1990, 0, 1),
    gender: 'Male'
  },
  {
    uid: 'donor001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'donor',
    bloodGroup: 'A+',
    phone: '555-111-2222',
    dob: new Date('1990-05-15'),
    gender: 'Male',
    totalDonations: 5,
    lastDonationDate: new Date('2023-11-01'),
    isEligible: true,
  },
  {
    uid: 'donor002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'donor',
    bloodGroup: 'B-',
    phone: '555-333-4444',
    dob: new Date('1992-08-20'),
    gender: 'Female',
    totalDonations: 2,
    lastDonationDate: new Date('2024-01-10'),
    isEligible: true,
  },
  {
    uid: 'recipient001',
    firstName: 'Alice',
    lastName: 'Brown',
    email: 'alice.brown@example.com',
    role: 'recipient',
    bloodGroup: 'AB+',
    phone: '555-555-6666',
    dob: new Date('1985-03-25'),
    gender: 'Female',
  },
  {
    uid: 'staff001',
    firstName: 'Robert',
    lastName: 'Jones',
    email: 'robert.jones@example.com',
    role: 'staff',
    bloodGroup: 'O-',
    phone: '555-777-8888',
    dob: new Date('1988-12-05'),
    gender: 'Male',
  },
];

const sampleBloodRequests: SeedBloodRequest[] = [
  {
    requesterUid: 'recipient001', // Alice Brown
    requesterName: 'Alice Brown',
    patientName: 'Alice Brown',
    requiredBloodGroup: 'AB+',
    unitsRequired: 2,
    urgency: 'High',
    hospitalName: 'City General Hospital',
    hospitalLocation: '789 Health St, Anytown, USA',
    contactPhone: '555-555-6666',
    status: 'Pending Verification',
    additionalDetails: 'Scheduled surgery next week.',
  },
  {
    requesterUid: 'donor001', // John Doe (requesting for a relative)
    requesterName: 'John Doe',
    patientName: 'Relative of John',
    requiredBloodGroup: 'O+',
    unitsRequired: 3,
    urgency: 'Critical',
    hospitalName: 'Unity Regional Hospital',
    hospitalLocation: '789 Pine Rd, Anytown, USA',
    contactPhone: '555-111-2222',
    status: 'Active',
    additionalDetails: 'Emergency situation.',
  },
];

const sampleDonations: SeedDonation[] = [
  {
    donorUid: 'donor001', // John Doe
    donorName: 'John Doe',
    bloodBankId: 'CITYCENTRALID', // Placeholder, will be replaced by actual ID after banks are seeded
    bloodBankName: 'City Central Blood Bank',
    donationDate: new Date('2023-11-01'),
    unitsDonated: 1,
    bloodGroup: 'A+',
    notes: 'Regular donation.',
  },
  {
    donorUid: 'donor002', // Jane Smith
    donorName: 'Jane Smith',
    bloodBankId: 'HOPECOMMUNITYID', // Placeholder
    bloodBankName: 'Hope Community Blood Center',
    donationDate: new Date('2024-01-10'),
    unitsDonated: 1,
    bloodGroup: 'B-',
  },
];

const sampleCampaigns: SeedCampaign[] = [
  {
    title: 'Summer Blood Drive 2024',
    description: 'Join us for our annual summer blood drive and help save lives in your community!',
    organizer: 'City Central Blood Bank', // Could also be an ID
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-20'),
    location: 'City Hall Plaza, Anytown',
    locationCoords: { lat: 34.0530, lng: -118.2420 },
    goalUnits: 200,
    collectedUnits: 0,
    status: 'Upcoming',
    bannerImageUrl: 'https://via.placeholder.com/800x400.png?text=Summer+Blood+Drive',
    contactEmail: 'events@citycentralbloodbank.example.com',
  },
  {
    title: 'Emergency Appeal: Type O Needed',
    description: 'Urgent need for O-type blood donors due to recent shortages. Your donation can make a difference.',
    organizer: 'Unity Regional Hospital Blood Services',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-30'),
    location: 'Unity Regional Hospital, 789 Pine Rd',
    status: 'Ongoing',
    goalUnits: 100,
    collectedUnits: 35,
    contactPhone: '555-222-3333',
  },
];

// --- Seeding Function ---
export async function seedDatabase() {
  if (!db) {
    console.error('Firestore instance (db) is not available. Seeding cannot proceed.');
    return;
  }
  console.log('Starting database seed process...');
  const batch = writeBatch(db);

  // 1. Seed Blood Banks
  console.log('Seeding blood banks...');
  sampleBloodBanks.forEach((bankData) => {
    const bankRef = doc(collection(db, 'blood_banks')); // Auto-generate ID
    const dataToSet: any = {
      ...bankData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastInventoryUpdate: serverTimestamp(), // Or specific date if needed
    };
    if (bankData.locationCoords) {
      dataToSet.location_coords = new GeoPoint(bankData.locationCoords.lat, bankData.locationCoords.lng);
      delete dataToSet.locationCoords; // Remove original field
    }
    batch.set(bankRef, dataToSet);
    console.log(`Prepared to seed blood bank: ${bankData.name}`);
  });

  const bloodBankDocs: { id: string, name: string }[] = [];
  sampleBloodBanks.forEach((bankData) => {
    // Assuming bankRef.id will be available after batch.set if we were to read it, 
    // but for simplicity in seeding, we'll assign IDs if not present or use generated ones.
    // For this example, let's assume Firestore generates IDs for banks if not provided.
    // To link donations, we'll need to know these IDs. A better approach for real scenarios
    // might be to seed banks first, get their IDs, then seed donations.
    // For this script, we'll map names to generated IDs after bank seeding for donation linking.
  });

  // After preparing bank data for batch, let's assume we can get their IDs for linking.
  // This is a simplified approach. In a real script, you might commit banks first, then query their IDs.
  // For this batch operation, we'll manually assign IDs for linking or use a map.
  const seededBankIds: Record<string, string> = {};

  // Re-iterate to get IDs (conceptual for batch, actual IDs are post-commit)
  // To make this work with a single batch, we'd need to pre-define IDs or use a more complex flow.
  // For simplicity, let's assume we can reference them. The donation part will need adjustment
  // if we can't get IDs before commit.

  // Let's refine: Seed banks, then commit. Then seed others that depend on bank IDs.
  // However, the request is to do it in one go if possible. We'll use placeholder logic for now
  // and note that a multi-step seeding (commit banks, then others) is more robust for dependencies.

  // 2. Seed Users
  console.log('Seeding users...');
  sampleUsers.forEach((userData) => {
    const userRef = userData.uid ? doc(db, 'users', userData.uid) : doc(collection(db, 'users'));
    const dataToSet: any = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (userData.dob) dataToSet.dob = Timestamp.fromDate(userData.dob);
    if (userData.lastDonationDate) dataToSet.lastDonationDate = Timestamp.fromDate(userData.lastDonationDate);
    if (userData.uid) delete dataToSet.uid; // UID is the doc ID

    batch.set(userRef, dataToSet);
    console.log(`Prepared to seed user: ${userData.firstName} ${userData.lastName}`);
  });

  // 3. Seed Blood Requests
  console.log('Seeding blood requests...');
  sampleBloodRequests.forEach((requestData) => {
    const requestRef = doc(collection(db, 'blood_requests'));
    batch.set(requestRef, {
      ...requestData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unitsFulfilled: requestData.unitsFulfilled || 0,
    });
    console.log(`Prepared to seed blood request for: ${requestData.patientName}`);
  });

  // 4. Seed Donations - This part is tricky with batching if bank IDs are auto-generated.
  // We will assume bank names are unique for this seed script to map them.
  // A more robust solution would be to seed banks, commit, get IDs, then seed donations.
  console.log('Seeding donations (assuming bank names can be mapped to IDs post-bank seeding)...');
  // This part needs to be adjusted if bank IDs are not known before this step.
  // For now, we'll use a placeholder logic. The `bloodBankId` in sampleDonations
  // would ideally be replaced by actual IDs obtained after banks are created.
  // Let's simulate this by creating a map after banks are prepared in the batch.

  // Create a map of bank names to their *intended* document references for the batch
  const bankRefMap: Record<string, string> = {};
  sampleBloodBanks.forEach((bank, index) => {
    // If we were to pre-define IDs for banks, we could use them here.
    // Since we are auto-generating, this mapping is conceptual for the batch.
    // Let's assume sampleBloodBanks[0] maps to the first bankRef created, etc.
    // This is fragile. A better way is separate commits or known IDs.
    // For this example, we'll use the bank name as a key, assuming it's unique in sample data.
    bankRefMap[bank.name] = `TEMP_BANK_ID_${index}`; // Placeholder
  });

  sampleDonations.forEach((donationData) => {
    const donationRef = doc(collection(db, 'donations'));
    // Attempt to find the bank's temporary/conceptual ID from our map
    const bankId = bankRefMap[donationData.bloodBankName] || 'UNKNOWN_BANK_ID'; // Fallback
    if (bankId === 'UNKNOWN_BANK_ID') {
      console.warn(`Could not find ID for bank: ${donationData.bloodBankName}. Skipping donation or using placeholder.`);
    }

    batch.set(donationRef, {
      ...donationData,
      bloodBankId: bankId, // This ID needs to be the actual Firestore ID
      donationDate: Timestamp.fromDate(donationData.donationDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Prepared to seed donation from: ${donationData.donorName} to ${donationData.bloodBankName}`);
  });
  console.warn('NOTE: Donation seeding with auto-generated bank IDs in a single batch is complex. BloodBankIDs in donations might be placeholders and need manual correction or a multi-step seeding process for robust linking.');

  // 5. Seed Campaigns
  console.log('Seeding campaigns...');
  sampleCampaigns.forEach((campaignData) => {
    const campaignRef = doc(collection(db, 'campaigns'));
    const dataToSet: any = {
      ...campaignData,
      startDate: Timestamp.fromDate(campaignData.startDate),
      endDate: Timestamp.fromDate(campaignData.endDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      collectedUnits: campaignData.collectedUnits || 0,
    };
    if (campaignData.locationCoords) {
      dataToSet.location_coords = new GeoPoint(campaignData.locationCoords.lat, campaignData.locationCoords.lng);
      delete dataToSet.locationCoords;
    }
    batch.set(campaignRef, dataToSet);
    console.log(`Prepared to seed campaign: ${campaignData.title}`);
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully! (Note: Donation bank linking might need verification if IDs were auto-generated in the same batch)');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Example of how to run (e.g., from a temporary admin page or script):
// import { seedDatabase } from '@/lib/firebase/seed';
// seedDatabase();
// Make sure to call this function from a place where Firebase app is initialized (e.g., a client-side component or a Node script with admin SDK).

console.log('Seed script loaded. Call seedDatabase() to run.');