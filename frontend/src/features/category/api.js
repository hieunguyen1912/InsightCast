/**
 * Category Service - API integration for category management
 * Handles all category-related API calls
 */

import apiClient from '../../services/axiosClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

const categoryService = {
  
  async getCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch categories',
        data: []
      };
    }
  },

  /**
   * Get category tree (hierarchical structure with nested children)
   * Returns only root categories with their children recursively nested
   * @returns {Promise<Object>} API response with category tree
   */
  async getCategoryTree() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.TREE);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching category tree:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch category tree',
        data: []
      };
    }
  },

  /**
   * Get category by ID
   * @param {string|number} id - Category ID
   * @returns {Promise<Object>} API response with category data
   */
  async getCategoryById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BY_ID(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch category'
      };
    }
  },

  /**
   * Get root categories (categories without parent)
   * @returns {Promise<Object>} API response
   */
  async getRootCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.ROOT);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching root categories:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch root categories',
        data: []
      };
    }
  },

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} API response
   */
  async getCategoryBySlug(slug) {
    try {
      if (!slug) {
        return {
          success: false,
          error: 'Category slug is required'
        };
      }
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BY_SLUG(slug));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch category'
      };
    }
  },

  /**
   * Get category children
   * @param {string|number} id - Parent category ID
   * @returns {Promise<Object>} API response
   */
  async getCategoryChildren(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Category ID is required'
        };
      }
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.CHILDREN(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching category children:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch category children',
        data: []
      };
    }
  },

  /**
   * Get category breadcrumb
   * @param {string|number} id - Category ID
   * @returns {Promise<Object>} API response
   */
  async getCategoryBreadcrumb(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Category ID is required'
        };
      }
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BREADCRUMB(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching category breadcrumb:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch category breadcrumb',
        data: []
      };
    }
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Category name (required, 1-100 characters)
   * @param {string} categoryData.description - Description (optional, max 2000 characters)
   * @param {number} categoryData.displayOrder - Display order (optional)
   * @param {boolean} categoryData.isActive - Is active (optional)
   * @param {string} categoryData.icon - Icon (optional, max 50 characters)
   * @param {string} categoryData.color - Color hex code (optional, e.g., #FF5733)
   * @param {number} categoryData.parentId - Parent category ID (optional)
   * @returns {Promise<Object>} API response
   */
  async createCategory(categoryData) {
    try {
      // Validate required fields
      if (!categoryData.name || categoryData.name.trim().length === 0) {
        return {
          success: false,
          error: 'Category name is required'
        };
      }

      if (categoryData.name.length > 100) {
        return {
          success: false,
          error: 'Category name must not exceed 100 characters'
        };
      }

      // Prepare payload
      const payload = {
        name: categoryData.name.trim()
      };

      if (categoryData.description !== undefined && categoryData.description !== null) {
        if (categoryData.description.length > 2000) {
          return {
            success: false,
            error: 'Description must not exceed 2000 characters'
          };
        }
        payload.description = categoryData.description.trim() || null;
      }

      if (categoryData.displayOrder !== undefined && categoryData.displayOrder !== null) {
        payload.displayOrder = Number(categoryData.displayOrder);
      }

      if (categoryData.isActive !== undefined && categoryData.isActive !== null) {
        payload.isActive = Boolean(categoryData.isActive);
      }

      if (categoryData.icon !== undefined && categoryData.icon !== null) {
        if (categoryData.icon.length > 50) {
          return {
            success: false,
            error: 'Icon must not exceed 50 characters'
          };
        }
        payload.icon = categoryData.icon.trim() || null;
      }

      if (categoryData.color !== undefined && categoryData.color !== null) {
        payload.color = categoryData.color.trim() || null;
      }

      if (categoryData.parentId !== undefined && categoryData.parentId !== null) {
        payload.parentId = categoryData.parentId ? Number(categoryData.parentId) : null;
      }

      const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, payload);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating category:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || 'Validation failed'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create category'
      };
    }
  },

  /**
   * Update an existing category
   * @param {string|number} id - Category ID
   * @param {Object} categoryData - Updated category data (all fields optional)
   * @param {string} categoryData.name - Category name (optional, 1-100 characters)
   * @param {string} categoryData.description - Description (optional, max 2000 characters)
   * @param {number} categoryData.displayOrder - Display order (optional)
   * @param {boolean} categoryData.isActive - Is active (optional)
   * @param {string} categoryData.icon - Icon (optional, max 50 characters)
   * @param {string} categoryData.color - Color hex code (optional)
   * @param {number} categoryData.parentId - Parent category ID (optional)
   * @returns {Promise<Object>} API response
   */
  async updateCategory(id, categoryData) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Category ID is required'
        };
      }

      // Prepare payload with only provided fields
      const payload = {};

      if (categoryData.name !== undefined && categoryData.name !== null) {
        if (categoryData.name.trim().length === 0) {
          return {
            success: false,
            error: 'Category name cannot be empty'
          };
        }
        if (categoryData.name.length > 100) {
          return {
            success: false,
            error: 'Category name must not exceed 100 characters'
          };
        }
        payload.name = categoryData.name.trim();
      }

      if (categoryData.description !== undefined && categoryData.description !== null) {
        if (categoryData.description.length > 2000) {
          return {
            success: false,
            error: 'Description must not exceed 2000 characters'
          };
        }
        payload.description = categoryData.description.trim() || null;
      }

      if (categoryData.displayOrder !== undefined && categoryData.displayOrder !== null) {
        payload.displayOrder = Number(categoryData.displayOrder);
      }

      if (categoryData.isActive !== undefined && categoryData.isActive !== null) {
        payload.isActive = Boolean(categoryData.isActive);
      }

      if (categoryData.icon !== undefined && categoryData.icon !== null) {
        if (categoryData.icon.length > 50) {
          return {
            success: false,
            error: 'Icon must not exceed 50 characters'
          };
        }
        payload.icon = categoryData.icon.trim() || null;
      }

      if (categoryData.color !== undefined && categoryData.color !== null) {
        payload.color = categoryData.color.trim() || null;
      }

      if (categoryData.parentId !== undefined && categoryData.parentId !== null) {
        payload.parentId = categoryData.parentId ? Number(categoryData.parentId) : null;
      }

      const response = await apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), payload);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating category:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || 'Validation failed'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You do not have permission to update this category'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update category'
      };
    }
  },

  /**
   * Delete a category
   * @param {string|number} id - Category ID
   * @returns {Promise<Object>} API response
   */
  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete category'
      };
    }
  },

  flattenCategoryTree(categories = [], level = 0, result = []) {
    categories.forEach(category => {
      result.push({
        ...category,
        level,
        path: this.getCategoryPath(category, categories)
      });

      if (category.children && category.children.length > 0) {
        this.flattenCategoryTree(category.children, level + 1, result);
      }
    });

    return result;
  },

  /**
   * Find category by ID in tree structure
   * @param {Array} categories - Category tree array
   * @param {string|number} id - Category ID to find
   * @returns {Object|null} Found category or null
   */
  findCategoryInTree(categories, id) {
    for (const category of categories) {
      if (category.id === id) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = this.findCategoryInTree(category.children, id);
        if (found) return found;
      }
    }
    return null;
  },

  /**
   * Get articles by category ID with pagination
   * @param {string|number} categoryId - Category ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (0-based, default: 0)
   * @param {number} options.size - Items per page (default: 10)
   * @param {string} options.sortBy - Sort field (default: "publishedAt")
   * @param {string} options.sortDirection - Sort direction "asc" or "desc" (default: "desc")
   * @returns {Promise<Object>} API response with paginated articles
   */
  async getArticlesByCategory(categoryId, options = {}) {
    try {
      if (!categoryId) {
        return {
          success: false,
          error: 'Category ID is required',
          data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }
        };
      }

      const params = new URLSearchParams();
      params.append('page', options.page !== undefined ? options.page : 0);
      params.append('size', options.size !== undefined ? options.size : 10);
      params.append('sortBy', options.sortBy || 'publishedAt');
      params.append('sortDirection', options.sortDirection || 'desc');

      const response = await apiClient.get(
        `${API_ENDPOINTS.ARTICLES.BY_CATEGORY(categoryId)}?${params.toString()}`
      );

      // Handle response structure: response.data.data or response.data
      const data = response.data?.data || response.data;
      
      return {
        success: true,
        data: data || {
          content: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
          first: true,
          last: false
        }
      };
    } catch (error) {
      console.error(`Error fetching articles for category ${categoryId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch articles by category',
        data: {
          content: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
          first: true,
          last: false
        }
      };
    }
  }
};

export default categoryService;

