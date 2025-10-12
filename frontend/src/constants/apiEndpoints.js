/**
 * API endpoint constants
 * Centralized definition of all API endpoints used in the application
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },

  // Podcast endpoints
  PODCASTS: {
    EPISODES: '/episodes',
    EPISODE_BY_ID: (id) => `/episodes/${id}`,
    CATEGORIES: '/categories',
    SEARCH: '/episodes/search',
    TRENDING: '/episodes/trending',
    RECOMMENDED: '/episodes/recommended'
  },

  // User favorites and playlists
  USER: {
    FAVORITES: '/favorites',
    FAVORITE_BY_ID: (id) => `/favorites/${id}`,
    PLAYLISTS: '/playlists',
    PLAYLIST_BY_ID: (id) => `/playlists/${id}`,
    HISTORY: '/history',
    SUBSCRIPTIONS: '/subscriptions'
  },

  // AI endpoints
  AI: {
    GENERATE_CONTENT: '/ai/generate-content',
    TRANSCRIBE: '/ai/transcribe',
    ANALYZE: '/ai/analyze',
    SUGGESTIONS: (id) => `/ai/suggestions/${id}`,
    SUMMARIZE: (id) => `/ai/summarize/${id}`,
    CHAT: '/ai/chat'
  },

  // File upload endpoints
  UPLOAD: {
    AUDIO: '/upload/audio',
    IMAGE: '/upload/image',
    AVATAR: '/upload/avatar'
  },

  // Analytics and metrics
  ANALYTICS: {
    LISTENING_STATS: '/analytics/listening',
    EPISODE_STATS: (id) => `/analytics/episodes/${id}`,
    USER_STATS: '/analytics/user'
  }
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};
