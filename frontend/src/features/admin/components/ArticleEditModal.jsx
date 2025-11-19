/**
 * Article Edit Modal Component
 * Modal form for editing articles (Admin only)
 */

import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { Input, Textarea, Select, Button, Alert, Spinner, SpinnerInline } from '../../../components/common';
import adminService from '../api';
import categoryService from '../../category/api';

/**
 * ArticleEditModal component
 * @param {Object} props
 * @param {boolean} props.isOpen - Is modal open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.article - Article data to edit
 * @param {Function} props.onSuccess - Success callback
 */
function ArticleEditModal({ isOpen, onClose, article, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    categoryId: '',
    summary: '',
    featuredImage: ''
  });
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Populate form when article changes
  useEffect(() => {
    if (article && isOpen) {
      setFormData({
        title: article.title || '',
        description: article.description || '',
        content: article.content || '',
        categoryId: article.category?.id || article.categoryId || '',
        summary: article.summary || '',
        featuredImage: article.featuredImage || ''
      });
      setImagePreview(article.featuredImage || null);
      setFeaturedImageFile(null);
      setError(null);
      setValidationErrors({});
    }
  }, [article, isOpen]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const result = await categoryService.getCategoryTree();
      if (result.success && result.data) {
        const categoriesList = Array.isArray(result.data) 
          ? result.data 
          : (result.data.data || result.data.content || []);
        
        // Flatten category tree for dropdown
        const flattenCategories = (cats, level = 0) => {
          let flat = [];
          cats.forEach(cat => {
            flat.push({
              value: cat.id,
              label: '  '.repeat(level) + cat.name
            });
            if (cat.children && cat.children.length > 0) {
              flat = flat.concat(flattenCategories(cat.children, level + 1));
            }
          });
          return flat;
        };
        
        setCategories(flattenCategories(categoriesList));
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setFeaturedImageFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate title if provided
    if (formData.title && formData.title.trim().length > 0) {
      if (formData.title.trim().length < 10) {
        errors.title = 'Title must be at least 10 characters';
      } else if (formData.title.length > 255) {
        errors.title = 'Title must not exceed 255 characters';
      }
    }

    // Validate description if provided
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }

    // Validate content if provided
    if (formData.content && formData.content.trim().length > 0) {
      if (formData.content.trim().length < 100) {
        errors.content = 'Content must be at least 100 characters';
      }
    }

    // Validate summary if provided
    if (formData.summary && formData.summary.length > 2000) {
      errors.summary = 'Summary must not exceed 2000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Please fix validation errors');
      return;
    }

    // Prepare update data (only include fields that have values)
    const updateData = {};
    if (formData.title && formData.title.trim().length > 0) {
      updateData.title = formData.title.trim();
    }
    if (formData.description !== undefined) {
      updateData.description = formData.description.trim() || null;
    }
    if (formData.content && formData.content.trim().length > 0) {
      updateData.content = formData.content.trim();
    }
    if (formData.categoryId) {
      updateData.categoryId = parseInt(formData.categoryId);
    }
    if (formData.summary !== undefined) {
      updateData.summary = formData.summary.trim() || null;
    }
    if (formData.featuredImage && !featuredImageFile) {
      updateData.featuredImage = formData.featuredImage;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0 && !featuredImageFile) {
      setError('Please make at least one change');
      return;
    }

    setLoading(true);
    try {
      const result = await adminService.updateArticle(
        article.id,
        updateData,
        featuredImageFile
      );

      if (result.success) {
        if (onSuccess) {
          onSuccess(result.data);
        }
        onClose();
      } else {
        setError(result.error || 'Failed to update article');
      }
    } catch (err) {
      console.error('Error updating article:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
    const cleanBaseURL = baseURL.replace(/\/api\/v1$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBaseURL}${cleanUrl}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Article"
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <SpinnerInline className="mr-2" />
                Updating...
              </>
            ) : (
              'Update Article'
            )}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Title */}
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter article title (10-255 characters)"
          error={validationErrors.title}
          helperText={formData.title ? `${formData.title.length}/255 characters` : 'Optional: 10-255 characters'}
        />

        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter article description (max 500 characters)"
          rows={3}
          error={validationErrors.description}
          helperText={formData.description ? `${formData.description.length}/500 characters` : 'Optional: Max 500 characters'}
        />

        {/* Category */}
        <Select
          label="Category"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          options={[
            { value: '', label: 'Select a category...' },
            ...categories
          ]}
          disabled={loadingCategories}
          helperText="Optional: Select article category"
        />

        {/* Content */}
        <div>
          <Textarea
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Enter article content (HTML, minimum 100 characters)"
            rows={10}
            error={validationErrors.content}
            helperText={formData.content ? `${formData.content.trim().length} characters (min 100)` : 'Optional: Minimum 100 characters'}
          />
        </div>

        {/* Summary */}
        <Textarea
          label="Summary"
          name="summary"
          value={formData.summary}
          onChange={handleInputChange}
          placeholder="Enter article summary (max 2000 characters)"
          rows={4}
          error={validationErrors.summary}
          helperText={formData.summary ? `${formData.summary.length}/2000 characters` : 'Optional: Max 2000 characters'}
        />

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          
          {/* Current/Preview Image */}
          {imagePreview && (
            <div className="mb-3">
              <img
                src={imagePreview.startsWith('blob:') || imagePreview.startsWith('http') 
                  ? imagePreview 
                  : getImageUrl(imagePreview)}
                alt="Featured"
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Image Upload */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">
                {featuredImageFile ? 'Change Image' : 'Upload New Image'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setFeaturedImageFile(null);
                  setImagePreview(article?.featuredImage || null);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          
          <p className="mt-1 text-sm text-gray-500">
            Optional: Upload a new featured image (max 5MB)
          </p>
        </div>
      </form>
    </Modal>
  );
}

export default ArticleEditModal;

