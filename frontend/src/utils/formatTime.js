/**
 * Time formatting utilities
 * Handles conversion and formatting of time values for podcast duration, timestamps, etc.
 */

/**
 * Format seconds to MM:SS or HH:MM:SS format
 * @param {number} seconds - Time in seconds
 * @param {boolean} showHours - Whether to show hours for longer durations
 * @returns {string} Formatted time string
 */
export function formatDuration(seconds, showHours = false) {
  if (!seconds || seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (showHours || hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Parse time string to seconds
 * @param {string} timeString - Time string in MM:SS or HH:MM:SS format
 * @returns {number} Time in seconds
 */
export function parseTimeToSeconds(timeString) {
  if (!timeString) return 0;
  
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  return 0;
}

/**
 * Format date to relative time (e.g., "2 hours ago", "3 days ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

/**
 * Format date to readable format
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Get time remaining in current episode
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total duration in seconds
 * @returns {string} Time remaining string
 */
export function getTimeRemaining(currentTime, duration) {
  if (!duration || duration <= 0) return '';
  
  const remaining = duration - currentTime;
  return formatDuration(remaining, duration >= 3600);
}

/**
 * Format date to short relative time for news display (e.g., "2h ago", "3d ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Short relative time string
 */
export function formatNewsTime(date) {
  const relativeTime = formatRelativeTime(date);
  
  // Convert to shorter format for news display
  if (relativeTime.includes('minute')) {
    const minutes = relativeTime.match(/\d+/)?.[0] || '0';
    return `${minutes}m ago`;
  } else if (relativeTime.includes('hour')) {
    const hours = relativeTime.match(/\d+/)?.[0] || '0';
    return `${hours}h ago`;
  } else if (relativeTime.includes('day')) {
    const days = relativeTime.match(/\d+/)?.[0] || '0';
    return `${days}d ago`;
  } else if (relativeTime.includes('month')) {
    const months = relativeTime.match(/\d+/)?.[0] || '0';
    return `${months}mo ago`;
  } else if (relativeTime.includes('year')) {
    const years = relativeTime.match(/\d+/)?.[0] || '0';
    return `${years}y ago`;
  }
  
  return relativeTime;
}