import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_GOOGLE_CLOUD_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize analytics with better error handling
let analytics = null;
const initializeAnalytics = async () => {
    // Skip analytics initialization in non-browser environments or when offline
    if (typeof window === 'undefined' || !navigator.onLine) {
        return;
    }
    
    try {
        const supported = await isSupported();
        if (supported) {
            analytics = getAnalytics(app);
        }
    } catch (error) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.warn('Analytics initialization error:', error);
        }
    }
};

// Initialize analytics asynchronously
initializeAnalytics().catch(error => {
    if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to initialize analytics:', error);
    }
});

// Listen for online/offline changes
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        initializeAnalytics().catch(error => {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to initialize analytics after coming online:', error);
            }
        });
    });
}

export { app, auth, analytics };