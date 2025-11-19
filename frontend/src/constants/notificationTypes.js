/**
 * Notification Types and Constants
 * Defines notification types and related constants
 */

/**
 * Notification types that can be received from the backend
 */
export const NOTIFICATION_TYPES = {
  ARTICLE_SUBMITTED: 'ARTICLE_SUBMITTED',
  ARTICLE_APPROVED: 'ARTICLE_APPROVED',
  ARTICLE_REJECTED: 'ARTICLE_REJECTED',
  COMMENT_REPLY: 'COMMENT_REPLY',
  COMMENT_MENTION: 'COMMENT_MENTION',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
  // Add more types as needed
};

/**
 * Notification type labels for display
 */
export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.ARTICLE_SUBMITTED]: 'Article Submitted',
  [NOTIFICATION_TYPES.ARTICLE_APPROVED]: 'Article Approved',
  [NOTIFICATION_TYPES.ARTICLE_REJECTED]: 'Article Rejected',
  [NOTIFICATION_TYPES.COMMENT_REPLY]: 'Comment Reply',
  [NOTIFICATION_TYPES.COMMENT_MENTION]: 'Mentioned in Comment',
  [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: 'System Announcement',
};

/**
 * Notification type icons (using Lucide icon names)
 */
export const NOTIFICATION_TYPE_ICONS = {
  [NOTIFICATION_TYPES.ARTICLE_SUBMITTED]: 'FileText',
  [NOTIFICATION_TYPES.ARTICLE_APPROVED]: 'CheckCircle',
  [NOTIFICATION_TYPES.ARTICLE_REJECTED]: 'XCircle',
  [NOTIFICATION_TYPES.COMMENT_REPLY]: 'MessageSquare',
  [NOTIFICATION_TYPES.COMMENT_MENTION]: 'AtSign',
  [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: 'Bell',
};

/**
 * Notification type colors for badges/styling
 */
export const NOTIFICATION_TYPE_COLORS = {
  [NOTIFICATION_TYPES.ARTICLE_SUBMITTED]: 'blue',
  [NOTIFICATION_TYPES.ARTICLE_APPROVED]: 'green',
  [NOTIFICATION_TYPES.ARTICLE_REJECTED]: 'red',
  [NOTIFICATION_TYPES.COMMENT_REPLY]: 'purple',
  [NOTIFICATION_TYPES.COMMENT_MENTION]: 'orange',
  [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: 'gray',
};

/**
 * Get notification type label
 * @param {string} type - Notification type
 * @returns {string} Human-readable label
 */
export function getNotificationTypeLabel(type) {
  return NOTIFICATION_TYPE_LABELS[type] || type;
}

/**
 * Get notification type icon name
 * @param {string} type - Notification type
 * @returns {string} Icon name
 */
export function getNotificationTypeIcon(type) {
  return NOTIFICATION_TYPE_ICONS[type] || 'Bell';
}

/**
 * Get notification type color
 * @param {string} type - Notification type
 * @returns {string} Color name
 */
export function getNotificationTypeColor(type) {
  return NOTIFICATION_TYPE_COLORS[type] || 'gray';
}

/**
 * Get action URL for notification based on type and data
 * @param {Object} notification - Notification object
 * @returns {string|null} URL to navigate to, or null
 */
export function getNotificationActionUrl(notification) {
  const { type, dataMap } = notification;
  
  if (!dataMap) return null;
  
  switch (type) {
    case NOTIFICATION_TYPES.ARTICLE_SUBMITTED:
    case NOTIFICATION_TYPES.ARTICLE_APPROVED:
    case NOTIFICATION_TYPES.ARTICLE_REJECTED:
      if (dataMap.articleId) {
        return `/articles/${dataMap.articleId}`;
      }
      break;
    case NOTIFICATION_TYPES.COMMENT_REPLY:
    case NOTIFICATION_TYPES.COMMENT_MENTION:
      if (dataMap.articleId) {
        return `/articles/${dataMap.articleId}#comment-${dataMap.commentId || ''}`;
      }
      break;
    default:
      return null;
  }
  
  return null;
}

/**
 * Default pagination parameters
 */
export const DEFAULT_NOTIFICATION_PAGINATION = {
  page: 0,
  size: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc'
};

