/**
 * Notification Context
 * Manages real-time notifications from FCM and provides notification state globally
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { onMessageListener } from '../config/firebase-config';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications from API
  const loadNotifications = useCallback(async (page = 0, size = 10) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);

      // Load unread count
      const countResult = await notificationService.getUnreadCount();
      if (countResult.success) {
        setUnreadCount(countResult.data || 0);
      }

      // Load notifications
      const result = await notificationService.getNotifications({
        page,
        size,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      if (result.success) {
        setNotifications(result.data?.content || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Add new notification to the list (from FCM)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => {
      // Check if notification already exists (avoid duplicates)
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      // Add to beginning of list
      return [notification, ...prev];
    });
    
    // Increment unread count if notification is unread
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Update notification (e.g., mark as read)
  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, ...updates } : notif)
    );
    
    // Update unread count if marking as read
    if (updates.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    const deletedNotif = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    if (deletedNotif && !deletedNotif.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((payload) => {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(
        payload.notification?.title || 'New Notification',
        {
          body: payload.notification?.body || 'You have a new message',
          icon: payload.notification?.icon || '/vite.svg',
          badge: '/vite.svg',
          tag: payload.data?.notificationId || 'notification',
          requireInteraction: false,
          data: payload.data || {}
        }
      );

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to notification page if needed
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        } else {
          window.location.href = '/dashboard?module=notifications';
        }
      };
    }
  }, []);

  // Setup FCM message listener
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let unsubscribe = null;
    let isMounted = true;

    const setupListener = async () => {
      try {
        console.log('🔔 Setting up FCM message listener...');
        
        unsubscribe = await onMessageListener((payload) => {
          if (!isMounted) return;

          console.log('📬 FCM message received:', payload);

          // Show browser notification
          showBrowserNotification(payload);

          // If payload contains notification data, add it to the list
          // Backend should send notification data in payload.data
          if (payload.data?.notificationId) {
            // Backend sent structured notification data
            // Parse dataMap from data if it's a string
            let dataMap = payload.data.dataMap;
            if (!dataMap && payload.data.data) {
              try {
                dataMap = typeof payload.data.data === 'string' 
                  ? JSON.parse(payload.data.data) 
                  : payload.data.data;
              } catch (e) {
                // If parsing fails, use the data object directly (excluding notificationId, type, etc.)
                const { notificationId, type, title, body, createdAt, ...rest } = payload.data;
                dataMap = rest;
              }
            }
            
            // If still no dataMap, try to extract from payload.data (excluding metadata fields)
            if (!dataMap) {
              const { notificationId, type, title, body, createdAt, data, ...rest } = payload.data;
              dataMap = Object.keys(rest).length > 0 ? rest : null;
            }

            const notificationData = {
              id: parseInt(payload.data.notificationId),
              type: payload.data.type || 'SYSTEM_ANNOUNCEMENT',
              title: payload.notification?.title || payload.data.title || 'New Notification',
              body: payload.notification?.body || payload.data.body || 'You have a new message',
              data: payload.data.data || JSON.stringify(payload.data),
              dataMap: dataMap || payload.data,
              isRead: false,
              createdAt: payload.data.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            addNotification(notificationData);
          } else {
            // If no structured notification data, reload from API
            // This ensures we get the latest notifications from backend
            // The backend should have already saved the notification
            setTimeout(() => {
              loadNotifications(0, 10);
            }, 500); // Small delay to ensure backend has processed
          }
        });

        if (unsubscribe) {
          console.log('✅ FCM message listener registered successfully');
        }
      } catch (error) {
        console.error('❌ Error setting up FCM message listener:', error);
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
        console.log('🔕 FCM message listener unregistered');
      }
    };
  }, [isAuthenticated, addNotification, loadNotifications, showBrowserNotification]);

  // Load notifications on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, loadNotifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    addNotification,
    updateNotification,
    removeNotification,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

