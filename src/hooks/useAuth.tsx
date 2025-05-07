
// src/hooks/useAuth.tsx
"use client";

import * as React from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth'; // Use Firebase types

// Custom error for when a user profile is not found
export class ProfileNotFoundError extends Error {
  public readonly code: string;
  constructor(message: string) {
    super(message);
    this.name = "ProfileNotFoundError";
    this.code = "PROFILE_NOT_FOUND";
    // Ensure 'this' is correct for Error subclasses in older JS environments if needed
    // Object.setPrototypeOf(this, ProfileNotFoundError.prototype);
  }
}
import { auth, db } from '@/lib/firebase/client'; // Import Firebase instances
import { doc, onSnapshot, type DocumentData, type Timestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: Error | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    let unsubscribeProfile: (() => void) | null = null;

    // Check if Firebase auth is available
    if (!auth) {
      console.error("AuthProvider: Firebase Auth instance is not available.");
      setError(new Error("Firebase Auth service failed to initialize."));
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(`AuthProvider: Auth state changed. User: ${firebaseUser?.uid ?? 'null'}`);
      if (!isMounted) return;

      setLoading(true);
      setError(null);
      setUser(firebaseUser);
      setUserProfile(null);
      setIsAdmin(false);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      // Check for admin user
      if (firebaseUser && firebaseUser.email && firebaseUser.email.endsWith('@admin.com')) {
        console.log(`AuthProvider: Admin user detected (Email: ${firebaseUser.email}), bypassing profile fetch.`);
        setUser(firebaseUser); // User is already set above, but ensure it's here for clarity
        setUserProfile(null); // Admin users don't need a Firestore profile
        setIsAdmin(true);
        setLoading(false);
        setError(null);
        return; // Skip Firestore profile fetching for admins
      }

      if (firebaseUser && db) {
        console.log(`AuthProvider: User detected (UID: ${firebaseUser.uid}), setting up profile listener...`);
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          console.log(`AuthProvider: Profile snapshot received. Exists: ${docSnap.exists()}`);
          if (!isMounted) return;

          if (docSnap.exists()) {
            const profileData = docSnap.data() as DocumentData;

            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              phone: profileData.phone || '',
              dob: profileData.dob || null,
              bloodGroup: profileData.bloodGroup,
              gender: profileData.gender,
              role: profileData.role,
              createdAt: profileData.createdAt || null,
              updatedAt: profileData.updatedAt || null,
              lastDonationDate: profileData.lastDonationDate || null,
              medicalConditions: profileData.medicalConditions || null,
              isEligible: profileData.isEligible ?? false,
              nextEligibleDate: profileData.nextEligibleDate || null,
              totalDonations: profileData.totalDonations || 0,
            };
            setUserProfile(profile);
            setIsAdmin(profile.role === 'admin');
            setError(null);
          } else {
            console.warn(`AuthProvider: User document not found for UID: ${firebaseUser.uid}`);
            setUserProfile(null);
            setIsAdmin(false);
            // For non-admin users, if profile is not found, it's an error.
            setError(new ProfileNotFoundError("User profile data not found."));
          }
          setLoading(false);
        }, (profileError) => {
          console.error(`AuthProvider: Error listening to profile:`, profileError);
          if (isMounted) {
            setError(profileError);
            setUserProfile(null);
            setIsAdmin(false);
            setLoading(false);
          }
        });
      } else {
        console.log("AuthProvider: No user logged in or DB unavailable.");
        if (isMounted) {
          setUserProfile(null);
          setIsAdmin(false);
          setLoading(false);
          setError(null);
        }
      }
    }, (authError) => {
      console.error("AuthProvider: Error in onAuthStateChanged:", authError);
      if (isMounted) {
        setError(authError);
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      console.log("AuthProvider: Unmounting.");
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []); // Re-run if db instance changes (though unlikely)

  const value: AuthContextType = {
    user,
    userProfile,
    isAdmin,
    loading,
    error,
  };

  // This return statement must be valid JSX.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
