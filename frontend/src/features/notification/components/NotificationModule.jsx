/**
 * Notification Module Component
 * Full notification management page for dashboard
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Trash, X, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';
import notificationService from '../../../services/notificationService';
import { getNotificationTypeLabel, getNotificationActionUrl, DEFAULT_NOTIFICATION_PAGINATION } from '../../../constants/notificationTypes';

function NotificationModule() {
  const navigate = useNavigate();
  
  // Use context for real-time updates
  const { 
    unreadCount: contextUnreadCount,
    markAllAsRead: contextMarkAllAsRead,
    removeNotification: contextRemoveNotification,
    updateNotification: contextUpdateNotification
  } = useNotifications();
  
  // Local state for paginated view
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_NOTIFICATION_PAGINATION);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Load notifications
  const loadNotifications = async (page = pagination.page) => {
    try {
      setIsLoading(true);
      setError(null);

      // Unread count comes from context

      // Load notifications
      const result = await notificationService.getNotifications({
        page,
        size: pagination.size,
        sortBy: pagination.sortBy,
        sortDirection: pagination.sortDirection
      });

      if (result.success) {
        setNotifications(result.data?.content || []);
        setPagination(prev => ({
          ...prev,
          page: result.data?.page || page,
          totalElements: result.data?.totalElements || 0,
          totalPages: result.data?.totalPages || 0,
          hasNext: result.data?.hasNext || false,
          hasPrevious: result.data?.hasPrevious || false,
          first: result.data?.first || false,
          last: result.data?.last || false
        }));
      } else {
        setError(result.error || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read
    await handleMarkAsRead(notification.id);
    
    // Navigate to action URL if available
    const actionUrl = getNotificationActionUrl(notification);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id) => {
    try {
      const result = await notificationService.markAsRead(id);
      if (result.success) {
        setNotifications(prev =>
          prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
        );
        contextUpdateNotification(id, { isRead: true });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        contextMarkAllAsRead();
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    try {
      const result = await notificationService.deleteNotification(id);
      if (result.success) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        contextRemoveNotification(id);
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Delete read notifications
  const handleDeleteRead = async () => {
    try {
      const result = await notificationService.deleteReadNotifications();
      if (result.success) {
        setNotifications(prev => prev.filter(notif => notif.isRead === false));
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error('Error deleting read notifications:', err);
    }
  };

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return formatDate(dateString);
    } catch {
      return dateString;
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-gray-600 mt-1">
              {contextUnreadCount > 0 ? `${contextUnreadCount} unread notification${contextUnreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadNotifications()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            {contextUnreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </button>
            )}
            {notifications.some(n => n.isRead) && (
              <button
                onClick={handleDeleteRead}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash className="h-4 w-4" />
                Delete read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100">
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.has(notification.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelection(notification.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{notification.body}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                    {notification.type && (
                      <>
                        <span>•</span>
                        <span>{getNotificationTypeLabel(notification.type)}</span>
                      </>
                    )}
                    {notification.dataMap && Object.keys(notification.dataMap).length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">View details</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {notifications.length} of {pagination.totalElements} notifications
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadNotifications(pagination.page - 1)}
                disabled={pagination.first || isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => loadNotifications(pagination.page + 1)}
                disabled={pagination.last || isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationModule;

