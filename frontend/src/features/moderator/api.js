import apiClient from '../../services/axiosClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';


const articleService = {
 
  async createArticle(articleData) {
    try {
      if (!articleData.title || !articleData.content || !articleData.categoryId) {
        return {
          success: false,
          error: 'Title, content, and category are required'
        };
      }

      if (articleData.featuredImageFile && articleData.featuredImageFile instanceof File) {
        const formData = new FormData();
        
        const { featuredImageFile, ...articleJsonData } = articleData;
        formData.append('data', new Blob([JSON.stringify(articleJsonData)], { type: "application/json" }));
        formData.append('featuredImage', featuredImageFile);

        const response = await apiClient.post(
          API_ENDPOINTS.ARTICLES.CREATE, 
          formData
        );
        
        return {
          success: true,
          data: response.data
        };
      } else {
        const { featuredImageFile, ...payload } = articleData;
        
        const response = await apiClient.post(API_ENDPOINTS.ARTICLES.CREATE, payload);
        
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.error('Error creating article:', error);
      
      if (error.response?.status === 400) {
        const errorCode = error.response?.data?.code;
        const errorMessage = error.response?.data?.message || 'Validation failed';
        
        if (errorCode === 4001) {
          return {
            success: false,
            error: 'Category not found'
          };
        }
        if (errorCode === 8003) {
          return {
            success: false,
            error: 'Invalid file'
          };
        }
        if (errorCode === 8004) {
          return {
            success: false,
            error: 'File size exceeds maximum limit (10MB)'
          };
        }
        if (errorCode === 8005) {
          return {
            success: false,
            error: 'Invalid file type. Only images are allowed (JPEG, JPG, PNG, GIF, WEBP)'
          };
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Unauthenticated. Please login again.'
        };
      }
      
      if (error.response?.status === 500 && error.response?.data?.code === 8002) {
        return {
          success: false,
          error: 'Failed to upload image'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create article'
      };
    }
  },

  async getArticleById(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Article ID is required'
        };
      }

      const response = await apiClient.get(API_ENDPOINTS.ARTICLES.BY_ID(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching article:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Article not found'
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You do not have permission to view this article'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch article'
      };
    }
  },

  async updateArticle(id, articleData) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Article ID is required'
        };
      }

      if (articleData.featuredImageFile && articleData.featuredImageFile instanceof File) {
        const formData = new FormData();
        
        const { featuredImageFile, ...articleJsonData } = articleData;
        
        const updateData = {};
        if (articleJsonData.title !== undefined) updateData.title = articleJsonData.title?.trim();
        if (articleJsonData.description !== undefined) updateData.description = articleJsonData.description?.trim();
        if (articleJsonData.content !== undefined) updateData.content = articleJsonData.content;
        if (articleJsonData.categoryId !== undefined) updateData.categoryId = articleJsonData.categoryId ? Number(articleJsonData.categoryId) : null;
        
        formData.append('data', new Blob([JSON.stringify(articleJsonData)], { type: "application/json" }));
        formData.append('featuredImage', featuredImageFile);

        const response = await apiClient.put(API_ENDPOINTS.ARTICLES.UPDATE(id), formData);
        
        return {
          success: true,
          data: response.data
        };
      } else {
        const payload = {};
        
        if (articleData.title !== undefined) {
          payload.title = articleData.title?.trim();
        }
        if (articleData.content !== undefined) {
          payload.content = articleData.content;
        }
        if (articleData.categoryId !== undefined) {
          payload.categoryId = articleData.categoryId ? Number(articleData.categoryId) : null;
        }
        if (articleData.description !== undefined) {
          payload.description = articleData.description?.trim();
        }
        if (articleData.featuredImage !== undefined) {
          payload.featuredImage = articleData.featuredImage?.trim() || '';
        }

        if (payload.title !== undefined) {
          if (!payload.title) {
            return {
              success: false,
              error: 'Title cannot be empty'
            };
          }
          if (payload.title.length < 10 || payload.title.length > 255) {
            return {
              success: false,
              error: 'Title must be between 10 and 255 characters'
            };
          }
        }

        if (payload.content !== undefined) {
          if (!payload.content) {
            return {
              success: false,
              error: 'Content cannot be empty'
            };
          }
          const plainTextContent = payload.content.replace(/<[^>]*>/g, '').trim();
          if (plainTextContent.length < 100) {
            return {
              success: false,
              error: 'Content must be at least 100 characters (excluding HTML tags)'
            };
          }
        }

        if (payload.description !== undefined && payload.description && payload.description.length > 500) {
          return {
            success: false,
            error: 'Description must not exceed 500 characters'
          };
        }

        const response = await apiClient.put(API_ENDPOINTS.ARTICLES.UPDATE(id), payload);
        
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.error('Error updating article:', error);
      
      if (error.response?.status === 404) {
        const errorCode = error.response?.data?.code;
        if (errorCode === 7001) {
          return {
            success: false,
            error: 'Article not found'
          };
        }
        return {
          success: false,
          error: 'Article not found'
        };
      }
      
      if (error.response?.status === 400) {
        const errorCode = error.response?.data?.code;
        const errorMessage = error.response?.data?.message || 'Validation failed';
        
        if (errorCode === 7002) {
          return {
            success: false,
            error: 'Article can only be updated when status is DRAFT or REJECTED'
          };
        }
        if (errorCode === 4001) {
          return {
            success: false,
            error: 'Category not found'
          };
        }
        if (errorCode === 8003) {
          return {
            success: false,
            error: 'Invalid file'
          };
        }
        if (errorCode === 8004) {
          return {
            success: false,
            error: 'File size exceeds maximum limit (10MB)'
          };
        }
        if (errorCode === 8005) {
          return {
            success: false,
            error: 'Invalid file type. Only images are allowed (JPEG, JPG, PNG, GIF, WEBP)'
          };
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
      
      if (error.response?.status === 403) {
        const errorCode = error.response?.data?.code;
        if (errorCode === 7005) {
          return {
            success: false,
            error: 'You don\'t have permission to access this resource'
          };
        }
        return {
          success: false,
          error: 'You don\'t have permission to update this article'
        };
      }
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Unauthenticated. Please login again.'
        };
      }
      
      if (error.response?.status === 500 && error.response?.data?.code === 8002) {
        return {
          success: false,
          error: 'Failed to upload image'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update article'
      };
    }
  },

  async submitArticle(id) {
    try {
      // Validate id
      if (!id) {
        return {
          success: false,
          error: 'Article ID is required'
        };
      }

      const response = await apiClient.post(API_ENDPOINTS.ARTICLES.SUBMIT(id));
      
      // Response structure: { status, code, message, data: NewsArticleResponse, timestamp }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting article:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Article not found'
        };
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error ||
                           'Cannot submit article. Article must be in DRAFT status.';
        return {
          success: false,
          error: errorMessage
        };
      }
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You don\'t have permission to submit this article'
        };
      }
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Unauthenticated. Please login again.'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to submit article'
      };
    }
  },

  async getMyDrafts(params = {}) {
    try {
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'updatedAt',
        sortDirection: params.sortDirection || 'desc'
      };

      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ARTICLES.MY_DRAFTS}?${queryString}`;
      
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching drafts:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch drafts'
      };
    }
  },

  async getMySubmitted(params = {}) {
    try {
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'updatedAt',
        sortDirection: params.sortDirection || 'desc'
      };

      // Build query string
      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ARTICLES.MY_SUBMITTED}?${queryString}`;
      
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching submitted articles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch submitted articles'
      };
    }
  },
 
  async getMyApproved(params = {}) {
    try {
      // Build query parameters with defaults
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'publishedAt',
        sortDirection: params.sortDirection || 'desc'
      };

      // Build query string
      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ARTICLES.MY_APPROVED}?${queryString}`;
      
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching approved articles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch approved articles'
      };
    }
  },

  async getMyRejected(params = {}) {
    try {
      // Build query parameters with defaults
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'updatedAt',
        sortDirection: params.sortDirection || 'desc'
      };

      // Build query string
      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ARTICLES.MY_REJECTED}?${queryString}`;
      
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching rejected articles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch rejected articles'
      };
    }
  },

  async getMyAll(params = {}) {
    try {
      // Build query parameters with defaults
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        sortBy: params.sortBy || 'updatedAt',
        sortDirection: params.sortDirection || 'desc'
      };

      // Build query string
      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {})
      ).toString();

      const url = `${API_ENDPOINTS.ARTICLES.MY_ALL}?${queryString}`;
      
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching all articles:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch all articles'
      };
    }
  },

  async deleteArticle(id) {
    try {
      // Validate id
      if (!id) {
        return {
          success: false,
          error: 'Article ID is required'
        };
      }

      const response = await apiClient.delete(API_ENDPOINTS.ARTICLES.DELETE(id));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting article:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Article can only be deleted when status is DRAFT'
        };
      }
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Article not found'
        };
      }

      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error ||
                           'Cannot delete article. Only DRAFT articles can be deleted.';
        return {
          success: false,
          error: errorMessage
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete article'
      };
    }
  },

  async uploadFeaturedImage(id, file) {
    try {
      // Validate id
      if (!id) {
        return {
          success: false,
          error: 'Article ID is required'
        };
      }

      // Validate file
      if (!file) {
        return {
          success: false,
          error: 'File is required'
        };
      }

      // Allowed image types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        return {
          success: false,
          error: 'File must be an image (JPEG, JPG, PNG, GIF, or WEBP)'
        };
      }

      // Max file size: 10MB
      const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxFileSize) {
        return {
          success: false,
          error: 'File size must be less than 10MB'
        };
      }

      // Create FormData for file upload
      // FormData is used for multipart/form-data uploads
      // Backend expects: @RequestParam("file") MultipartFile file
      const formData = new FormData();
      formData.append('file', file);

      // axiosClient interceptor will automatically remove Content-Type header
      // when it detects FormData, allowing axios to set multipart/form-data with boundary
      const response = await apiClient.post(
        API_ENDPOINTS.ARTICLES.UPLOAD_FEATURED_IMAGE(id), 
        formData
      );

      // Response contains ImageResponseDto: { id, url, fileName, fileSize, contentType, createdAt, updatedAt }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error uploading featured image:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Article not found'
        };
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error ||
                           'Invalid file or validation failed';
        return {
          success: false,
          error: errorMessage
        };
      }
      
      if (error.response?.status === 413) {
        return {
          success: false,
          error: 'File size too large'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to upload featured image'
      };
    }
  }
};

export default articleService;

