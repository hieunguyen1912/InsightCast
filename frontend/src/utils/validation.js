/**
 * Input validation utilities
 * Provides common validation functions for forms and user inputs
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password is valid' };
}

/**
 * Sanitize HTML content to prevent XSS
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export function sanitizeHtml(content) {
  if (!content) return '';
  
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate podcast episode title
 * @param {string} title - Title to validate
 * @returns {Object} Validation result
 */
export function validateEpisodeTitle(title) {
  if (!title || title.trim().length === 0) {
    return { isValid: false, message: 'Title is required' };
  }
  
  if (title.length > 200) {
    return { isValid: false, message: 'Title must be less than 200 characters' };
  }
  
  // Check for valid characters (alphanumeric, spaces, common punctuation)
  const validTitleRegex = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
  if (!validTitleRegex.test(title)) {
    return { isValid: false, message: 'Title contains invalid characters' };
  }
  
  return { isValid: true, message: 'Title is valid' };
}

/**
 * Validate podcast episode description
 * @param {string} description - Description to validate
 * @returns {Object} Validation result
 */
export function validateEpisodeDescription(description) {
  if (!description || description.trim().length === 0) {
    return { isValid: false, message: 'Description is required' };
  }
  
  if (description.length > 2000) {
    return { isValid: false, message: 'Description must be less than 2000 characters' };
  }
  
  return { isValid: true, message: 'Description is valid' };
}

/**
 * Validate search query
 * @param {string} query - Search query to validate
 * @returns {Object} Validation result
 */
export function validateSearchQuery(query) {
  if (!query || query.trim().length === 0) {
    return { isValid: false, message: 'Search query is required' };
  }
  
  if (query.length < 2) {
    return { isValid: false, message: 'Search query must be at least 2 characters' };
  }
  
  if (query.length > 100) {
    return { isValid: false, message: 'Search query must be less than 100 characters' };
  }
  
  return { isValid: true, message: 'Search query is valid' };
}

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @param {number} options.maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
export function validateFileUpload(file, options = {}) {
  const { allowedTypes = [], maxSize = 10 * 1024 * 1024 } = options; // 10MB default
  
  if (!file) {
    return { isValid: false, message: 'No file selected' };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { isValid: false, message: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { isValid: true, message: 'File is valid' };
}
