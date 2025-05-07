
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
      // Validate all required Firebase config values
      const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
      const missingConfig = requiredConfig.filter(key => !(firebaseConfig as Record<string, unknown>)[key]);
      
      if (missingConfig.length) {
         const errorMsg = `Firebase configuration is missing required fields: ${missingConfig.join(', ')}. Check .env.local.`;
         console.error('Firebase Config Error:', {
           missingFields: missingConfig,
           config: {
             apiKey: !!firebaseConfig.apiKey,
             authDomain: !!firebaseConfig.authDomain,
             projectId: !!firebaseConfig.projectId,
             storageBucket: !!firebaseConfig.storageBucket,
             messagingSenderId: !!firebaseConfig.messagingSenderId,
             appId: !!firebaseConfig.appId
           }
         });
         throw new Error(errorMsg);
      }
      
      app = initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully with config:", {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain
      });
  } catch (e: any) {
      console.error("Firebase initialization failed:", {
        error: e.message,
        stack: e.stack,
        config: {
          apiKey: !!firebaseConfig.apiKey,
          authDomain: !!firebaseConfig.authDomain,
          projectId: !!firebaseConfig.projectId,
          storageBucket: !!firebaseConfig.storageBucket,
          messagingSenderId: !!firebaseConfig.messagingSenderId,
          appId: !!firebaseConfig.appId
        },
        envFileExists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      });
      throw new Error(`Firebase initialization failed: ${e.message}. Please check your configuration and restart the server.`);
  }
} else {
  app = getApp();
  console.log("Using existing Firebase app instance.");
}

let authInstance: Auth | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;
let functionsInstance: ReturnType<typeof getFunctions> | null = null;

// Initialize services with proper error handling
try {
    if (app) {
        // Initialize Auth with enhanced error handling
        authInstance = getAuth(app);
        if (!authInstance) {
            throw new Error("Failed to initialize Firebase Auth service");
        }
        // Updated auth initialization
        // The methods signInWithEmailAndPassword and createUserWithEmailAndPassword are imported directly
        // from 'firebase/auth' and used with the authInstance, not as properties of it.
        // Therefore, checking for them on authInstance directly is incorrect.
        
        console.log("Firebase Auth service initialized successfully");
        
        // Initialize other services
        dbInstance = getFirestore(app);
        storageInstance = getStorage(app);
        functionsInstance = getFunctions(app);
        
        console.log("Firebase services initialized successfully:", {
          auth: !!authInstance,
          firestore: !!dbInstance,
          storage: !!storageInstance,
          functions: !!functionsInstance
        });
        
        // Set persistence for auth if needed
        // await setPersistence(authInstance, browserSessionPersistence);
    } else {
        throw new Error("Firebase app instance is not available. Cannot get services.");
    }
} catch (e: any) {
    console.error("Error initializing Firebase services:", {
      error: e.message,
      stack: e.stack,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        firebaseConfigPresent: !!firebaseConfig.apiKey,
        appInitialized: !!app
      }
    });
    throw new Error(`Firebase service initialization failed: ${e.message}. Please check your configuration and restart the development server.`);
}

// Add auth state change listener for global auth state management
if (authInstance) {
    onAuthStateChanged(authInstance, (user) => {
        // Handle auth state changes globally
        console.log('Auth state changed:', user ? user.email : 'No user');
    }, (error) => {
        console.error('Auth state error:', error);
    });
}

// --- Emulator Setup (Optional - Controlled by Environment Variable) ---
// NOTE: Ensure emulators are running before uncommenting.
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

if (
    useEmulators &&
    app && // Ensure app is initialized
    typeof window !== 'undefined' && // Ensure this runs only client-side
    window.location.hostname === 'localhost'
   ) {
   console.log("🚀 Connecting to Firebase Emulators...");
   try {
       // Use 127.0.0.1 for emulators
       // Check if already connected to avoid errors on hot-reloads
       if (authInstance && !authInstance.emulatorConfig) { // Removed optional chaining as authInstance is confirmed non-null
            connectAuthEmulator(authInstance, "http://127.0.0.1:9099", { disableWarnings: true });
            console.log("🔒 Auth Emulator connected to http://127.0.0.1:9099");
            // After connecting, emulatorConfig should be set. Add a check for type safety.
            if (authInstance.emulatorConfig) {
                const emulatorConfig = authInstance.emulatorConfig; // Intermediate variable
                console.log(`Auth emulator configured at: http://${emulatorConfig.host}:${emulatorConfig.port}`);
            } else {
                console.warn("Auth emulator config not found after attempting to connect.");
            }
       } else if (authInstance && authInstance.emulatorConfig) {
            // If already configured (e.g. due to hot reload and already connected), log its current config
            // This handles the case where the emulator was already connected (e.g. on HMR)
            const emulatorConfig = authInstance.emulatorConfig; // Intermediate variable
            console.log(`Auth emulator already configured at: http://${emulatorConfig.host}:${emulatorConfig.port}`);
       }
       if (dbInstance && !(dbInstance as any)._settings?.host) { // Check Firestore connection more reliably
           connectFirestoreEmulator(dbInstance, "127.0.0.1", 8080);
           console.log("📄 Firestore Emulator connected to 127.0.0.1:8080");
       }
       if (storageInstance && !(storageInstance as any)?.emulatorConfig) {
            connectStorageEmulator(storageInstance, "127.0.0.1", 9199);
            console.log("📦 Storage Emulator connected to 127.0.0.1:9199");
       }
        if (functionsInstance && !(functionsInstance as any)?.emulatorConfig) {
             connectFunctionsEmulator(functionsInstance, "127.0.0.1", 5001);
             console.log("🔧 Functions Emulator connected to 127.0.0.1:5001");
        }
       console.log("✅ Successfully connected to Firebase Emulators.");
   } catch (emulatorError: any) {
        console.error("🔴 Error connecting to Firebase emulators:", emulatorError.message);
   }
} else {
     console.log("🌐 Connecting to production Firebase services.");
}
// --- End Emulator Setup ---

// Export the instances, handling potential null cases if initialization failed
export const auth = authInstance;
export { signInWithEmailAndPassword, createUserWithEmailAndPassword };
export const db = dbInstance;
export const storage = storageInstance;
export const functions = functionsInstance;
export { app }; // Export app instance if needed elsewhere
