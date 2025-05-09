# Blood Donation System Examples

## Data Models and Relationships

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Donation : makes
    User ||--o{ Request : creates
    User ||--o{ Campaign : participates
    BloodBank ||--o{ Donation : stores
    BloodBank ||--o{ Request : fulfills
    Campaign ||--o{ Donation : collects

    User {
        string uid PK
        string email
        string firstName
        string lastName
        string phone
        timestamp dob
        enum bloodGroup
        enum gender
        enum role
        timestamp lastDonationDate
        string medicalConditions
        boolean isEligible
        timestamp nextEligibleDate
        number totalDonations
    }

    BloodBank {
        string id PK
        string name
        string location
        object locationCoords
        string contactPhone
        string operatingHours
        string website
        object inventory
        timestamp lastInventoryUpdate
        array servicesOffered
    }

    Campaign {
        string id PK
        string title
        string description
        string organizer
        timestamp startDate
        timestamp endDate
        string timeDetails
        string location
        object locationCoords
        string imageUrl
        number goalUnits
        number collectedUnits
        enum status
        number participantsCount
        array requiredBloodGroups
    }

## Code Examples

### Frontend Components

#### User Authentication Hook (useAuth.tsx)
```typescript
// Custom hook for Firebase Authentication
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
```

### Firebase Configuration

#### Firebase Client Setup (client.ts)
```typescript
// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
```

### Middleware Example

#### Authentication Middleware
```typescript
import { type NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/admin';

export async function authMiddleware(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return new Response('Invalid token', { status: 403 });
  }
}
```

### Type Definitions

#### Blood Bank Type
```typescript
export interface BloodBank {
  id?: string;
  name: string;
  location: string;
  locationCoords?: { lat: number; lng: number };
  contactPhone?: string;
  operatingHours?: string;
  website?: string;
  inventory: BloodInventoryMap;
  lastInventoryUpdate: Timestamp;
  servicesOffered?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

This documentation provides examples of key components and their interactions within the Blood Donation System. The ERD diagram illustrates the relationships between different entities, while the code snippets demonstrate the implementation of various features across the application stack.