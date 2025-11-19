import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// VAPID Key from environment variables
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

// Initialize Firebase App
let app = null;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export async function getMessagingInstance() {
  if (messaging) {
    return messaging;
  }

  try {
    // Check if messaging is supported in this browser
    const isMessagingSupported = await isSupported();
    
    if (!isMessagingSupported) {
      console.warn('Firebase Messaging is not supported in this browser');
      return null;
    }

    if (!app) {
      console.error('Firebase app is not initialized');
      return null;
    }

    messaging = getMessaging(app, {
    });
    return messaging;
  } catch (error) {
    console.error('Error getting messaging instance:', error);
    return null;
  }
}

export async function getFcmToken() {
  try {
    const messagingInstance = await getMessagingInstance();
    
    if (!messagingInstance) {
      console.error('Messaging is not available');
      return null;
    }

    // Check if VAPID key is configured
    if (!VAPID_KEY || VAPID_KEY === 'YOUR_VAPID_KEY') {
      console.error('VAPID key is not configured. Please set VITE_FIREBASE_VAPID_KEY in your .env file');
      return null;
    }

    // Request notification permission if not already granted/denied
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Notification permission not granted');
          return null;
        }
      } else if (Notification.permission === 'denied') {
        console.warn('Notification permission is denied');
        return null;
      }
    } else {
      console.warn('This browser does not support notifications');
      return null;
    }

    // Get FCM token
    const token = await getToken(messagingInstance, { 
      vapidKey: VAPID_KEY 
    });

    if (token) {
      console.log('FCM Token retrieved successfully:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    
    // Provide helpful error messages
    if (error.code === 'messaging/unsupported-browser') {
      console.error('This browser does not support Firebase Cloud Messaging');
    } else if (error.code === 'messaging/permission-default') {
      console.error('Notification permission is required');
    } else if (error.code === 'messaging/permission-denied') {
      console.error('Notification permission was denied');
    }
    
    return null;
  }
}


export async function onMessageListener(callback) {
  // Khởi tạo messaging nếu chưa có
  if (!messaging) {
    console.log('Initializing messaging for foreground listener...');
    const messagingInstance = await getMessagingInstance();
    
    if (!messagingInstance) {
      console.warn('Messaging is not available, cannot register listener');
      return () => {};
    }
  }

  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    if (callback) {
      callback(payload);
    }
  });
}


export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission was previously denied');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export default {
  getFcmToken,
  onMessageListener,
  requestNotificationPermission,
  getMessagingInstance
};

