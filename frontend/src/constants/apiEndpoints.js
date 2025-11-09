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
  },

  // Categories endpoints (for article categories management)
  CATEGORIES: {
    LIST: '/categories',
    TREE: '/categories/tree',
    ROOT: '/categories/root',
    BY_ID: (id) => `/categories/${id}`,
    BY_SLUG: (slug) => `/categories/slug/${slug}`,
    CHILDREN: (id) => `/categories/${id}/children`,
    BREADCRUMB: (id) => `/categories/${id}/breadcrumb`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`
  },

  // Article endpoints (for MODERATOR role)
  ARTICLES: {
    CREATE: '/articles',
    BY_ID: (id) => `/articles/${id}`,
    UPDATE: (id) => `/articles/${id}`,
    DELETE: (id) => `/articles/${id}`,
    SUBMIT: (id) => `/articles/${id}/submit`,
    UPLOAD_FEATURED_IMAGE: (id) => `/news-articles/${id}/featured-image`,
    BY_CATEGORY: (id) => `/articles/${id}/category`,
    MY_DRAFTS: '/articles/my-drafts',
    MY_SUBMITTED: '/articles/my-submitted',
    MY_APPROVED: '/articles/my-approved',
    MY_REJECTED: '/articles/my-rejected',
    MY_ALL: '/articles/my-all',
    GENERATE_AUDIO: (id) => `/articles/${id}/generate-audio`,
    CHECK_AUDIO_STATUS: (audioFileId) => `/articles/audio/${audioFileId}/check-status`,
    STREAM_AUDIO: (audioFileId) => `/articles/audio/${audioFileId}/stream`,
    DOWNLOAD_AUDIO: (audioFileId) => `/articles/audio/${audioFileId}/download`,
    CANCEL_AUDIO: (audioFileId) => `/articles/audio/${audioFileId}/cancel`
  },

  // Public article endpoints (for displaying articles to users)
  NEWS: {
    FEATURED: '/news/featured',
    TRENDING: '/news/trending',
    LATEST: '/news/latest',
    BY_ID: (id) => `/news/${id}`,
    SEARCH: '/news/search',
    CATEGORIES: '/news/categories',
    RELATED: (id) => `/news/${id}/related`
  },

  // Admin endpoints
  ADMIN: {
    // Article approval
    PENDING_ARTICLES: '/admin/articles/pending-review',
    APPROVE_ARTICLE: (id) => `/admin/articles/${id}/approve`,
    REJECT_ARTICLE: (id) => `/admin/articles/${id}/reject`,
    
    // User management
    USERS: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,
    UPDATE_USER: (id) => `/admin/users/${id}`,
    UPDATE_USER_STATUS: (id) => `/admin/users/${id}/status`,
    DELETE_USER: (id) => `/admin/users/${id}`,
    USER_ROLES: (userId) => `/users/${userId}/roles`,
    ASSIGN_USER_ROLE: (userId) => `/users/${userId}/roles`,
    REVOKE_USER_ROLE: (userId, roleId) => `/users/${userId}/roles/${roleId}`,
    
    // Role management
    ROLES: '/roles',
    ROLES_ALL: '/roles/all',
    ROLE_BY_ID: (id) => `/roles/${id}`,
    ROLE_BY_CODE: (code) => `/roles/code/${code}`,
    CREATE_ROLE: '/roles',
    UPDATE_ROLE: (id) => `/roles/${id}`,
    DELETE_ROLE: (id) => `/roles/${id}`,
    ACTIVATE_ROLE: (id) => `/roles/${id}/activate`,
    
    // Permission management
    PERMISSIONS: '/permissions',
    PERMISSIONS_ALL: '/permissions/all',
    PERMISSION_BY_ID: (id) => `/permissions/${id}`,
    ROLE_PERMISSIONS: (id) => `/roles/${id}/permissions`,
    ASSIGN_PERMISSION: (id) => `/roles/${id}/permissions`,
    REVOKE_PERMISSION: (roleId, permissionId) => `/roles/${roleId}/permissions/${permissionId}`,
    
    // Statistics
    STATS: '/admin/stats'
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
