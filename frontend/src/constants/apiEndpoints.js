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
    // Article favorites endpoints
    ARTICLE_FAVORITES: '/user/me/favorites',
    ADD_ARTICLE_FAVORITE: (articleId) => `/user/me/favorites/${articleId}`,
    REMOVE_ARTICLE_FAVORITE: (favoriteId) => `/user/me/favorites/${favoriteId}`,
    PLAYLISTS: '/playlists',
    PLAYLIST_BY_ID: (id) => `/playlists/${id}`,
    HISTORY: '/history',
    SUBSCRIPTIONS: '/subscriptions',
    AUDIO: '/user/audio',
    // FCM Token Management
    REGISTER_FCM_TOKEN: '/user/me/fcm-tokens',
    REMOVE_FCM_TOKEN: (token) => `/user/me/fcm-tokens/${token}`,
    // Notification endpoints
    NOTIFICATIONS: '/user/me/notifications',
    NOTIFICATION_UNREAD_COUNT: '/user/me/notifications/unread-count',
    NOTIFICATION_MARK_READ: (id) => `/user/me/notifications/${id}/read`,
    NOTIFICATION_MARK_ALL_READ: '/user/me/notifications/read-all',
    NOTIFICATION_DELETE: (id) => `/user/me/notifications/${id}`,
    NOTIFICATION_DELETE_READ: '/user/me/notifications/read'
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
    GENERATE_AUDIO_FROM_SUMMARY: (id) => `/articles/${id}/generate-audio-from-summary`,
    GET_AUDIO_FILES: (articleId) => `/articles/${articleId}/audio`,
    CHECK_AUDIO_STATUS: (audioFileId) => `/articles/audio/${audioFileId}/check-status`,
    STREAM_AUDIO: (audioFileId) => `/articles/audio/${audioFileId}/stream`,
    DOWNLOAD_AUDIO: (audioFileId) => `/articles/audio/${audioFileId}/download`,
    DELETE_AUDIO: (audioFileId) => `/articles/audio/${audioFileId}`,
    CANCEL_AUDIO: (audioFileId) => `/articles/audio/${audioFileId}/cancel`,
    GENERATE_SUMMARY: '/articles/generate-summary'
  },

  // Public article endpoints (for displaying articles to users)
  NEWS: {
    FEATURED: '/news/featured',
    TRENDING: '/news/trending',
    LATEST: '/news/latest',
    BY_ID: (id) => `/news/${id}`,
    SEARCH: '/news/search',
    BY_CATEGORY: (categoryId) => `/news/category/${categoryId}`,
    RELATED: (id) => `/news/${id}/related`
  },

  // Admin endpoints
  ADMIN: {
    // Article management
    ARTICLES: {
      ALL: '/admin/articles/all',
      BY_ID: (id) => `/admin/articles/${id}`,
      APPROVED: '/admin/articles/approved',
      REJECTED: '/admin/articles/rejected',
      DRAFTS: '/admin/articles/drafts',
      PENDING_REVIEW: '/admin/articles/pending-review',
      APPROVE: (id) => `/admin/articles/${id}/approve`,
      REJECT: (id) => `/admin/articles/${id}/reject`,
      UPDATE: (id) => `/admin/articles/${id}`,
      DELETE: (id) => `/admin/articles/${id}`
    },
    
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
    STATS: {
      DASHBOARD: '/admin/stats/dashboard',
      ARTICLES: '/admin/stats/articles',
      USERS: '/admin/stats/users',
      PENDING_REVIEW: '/admin/stats/articles/pending-review',
      TRENDS: '/admin/stats/articles/trends',
      TOP_AUTHORS: '/admin/stats/top-authors',
      ENGAGEMENT: '/admin/stats/engagement'
    }
  },

  // TTS Configuration endpoints
  TTS_CONFIG: {
    CREATE: '/tts-configs',
    GET_USER: '/tts-configs',
    UPDATE: (id) => `/tts-configs/${id}`,
    DELETE: (id) => `/tts-configs/${id}`
  },

  // Comment endpoints
  COMMENTS: {
    CREATE: (articleId) => `/comments/articles/${articleId}`,
    GET_BY_ARTICLE: (articleId) => `/comments/articles/${articleId}`,
    UPDATE: (articleId, commentId) => `/comments/articles/${articleId}/comments/${commentId}`,
    DELETE: (articleId, commentId) => `/comments/articles/${articleId}/comments/${commentId}`,
    GET_REPLIES: (commentId) => `/comments/${commentId}/replies`
  },

  // Test endpoints
  TEST: {
    FCM_SEND: '/test/fcm/send'
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
