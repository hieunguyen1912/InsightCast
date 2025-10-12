/**
 * Application constants
 * Centralized definition of app-wide constants, configuration values, and enums
 */

// Application metadata
export const APP_CONFIG = {
  NAME: 'PodcastAI',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered podcast platform',
  AUTHOR: 'PodcastAI Team'
};

// Audio player constants
export const AUDIO_CONFIG = {
  DEFAULT_VOLUME: 0.8,
  VOLUME_STEP: 0.1,
  SEEK_STEP: 10, // seconds
  BUFFER_SIZE: 1024 * 1024, // 1MB
  SUPPORTED_FORMATS: ['mp3', 'wav', 'm4a', 'ogg', 'aac'],
  MAX_FILE_SIZE: 100 * 1024 * 1024 // 100MB
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50]
};

// Search and filter constants
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_DELAY: 300, // milliseconds
  MAX_SEARCH_RESULTS: 100
};

// AI feature constants
export const AI_CONFIG = {
  MAX_PROMPT_LENGTH: 1000,
  MAX_RESPONSE_LENGTH: 5000,
  DEFAULT_STYLE: 'conversational',
  SUPPORTED_STYLES: ['conversational', 'formal', 'casual', 'technical', 'humorous'],
  MAX_AUDIO_DURATION: 60 * 60, // 1 hour in seconds
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
};

// User interface constants
export const UI_CONFIG = {
  TOAST_DURATION: 3000, // milliseconds
  MODAL_ANIMATION_DURATION: 300,
  LOADING_DEBOUNCE: 200,
  INFINITE_SCROLL_THRESHOLD: 100, // pixels
  RESPONSIVE_BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  }
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  TOKEN_EXPIRATION: 'tokenExpiration',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
  AUDIO_SETTINGS: 'audioSettings',
  PLAYBACK_HISTORY: 'playbackHistory'
};

// Podcast categories
export const PODCAST_CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'News',
  'Sports',
  'Health',
  'Science',
  'Arts',
  'Comedy',
  'Music',
  'Society & Culture',
  'True Crime',
  'History',
  'Fiction',
  'Non-Fiction',
  'Self-Help',
  'Religion',
  'Politics',
  'Travel'
];

// Episode status
export const EPISODE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  PRIVATE: 'private'
};

// User roles
export const USER_ROLES = {
  LISTENER: 'listener',
  CREATOR: 'creator',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  UNSUPPORTED_FORMAT: 'File format is not supported.',
  AI_SERVICE_ERROR: 'AI service is temporarily unavailable.',
  TRANSCRIPTION_ERROR: 'Failed to transcribe audio. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  EPISODE_SAVED: 'Episode saved successfully!',
  FAVORITE_ADDED: 'Added to favorites!',
  FAVORITE_REMOVED: 'Removed from favorites!',
  CONTENT_GENERATED: 'Content generated successfully!',
  TRANSCRIPTION_COMPLETE: 'Transcription completed!'
};
