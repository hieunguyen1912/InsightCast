import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Send, X, Image as ImageIcon, Upload, FolderTree } from 'lucide-react';
import { Button, Input, Textarea, Alert } from '../../../components/common';
import articleService from '../api';
import categoryService from '../../category/api';
import apiClient from '../../../services/axiosClient';
import CategoryPickerModal from './CategoryPickerModal';

function ArticleEditor({ article = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    featuredImage: '',
    categoryId: ''
  });
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [featuredImageFile, setFeaturedImageFile] = useState(null); // Store file for multipart upload
  const quillRef = useRef(null);

  // Load article data if editing
  useEffect(() => {
    if (article) {
      const categoryId = article.categoryId || article.category?.id || '';
      setFormData({
        title: article.title || '',
        description: article.description || '',
        content: article.content || '',
        featuredImage: article.featuredImage || '',
          categoryId: categoryId
      });

      // Load category info if categoryId exists
      if (categoryId) {
        loadCategoryInfo(categoryId);
      }
    }
  }, [article]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup blob URL if it exists
      if (formData.featuredImage && formData.featuredImage.startsWith('blob:')) {
        URL.revokeObjectURL(formData.featuredImage);
      }
    };
  }, []);

  // Load category information by ID
  const loadCategoryInfo = async (categoryId) => {
    try {
      // First try to get from tree
      const treeResult = await categoryService.getCategoryTree();
      if (treeResult.success && treeResult.data) {
        const category = categoryService.findCategoryInTree(
          Array.isArray(treeResult.data) ? treeResult.data : (treeResult.data.content || []),
          categoryId
        );
        if (category) {
          setSelectedCategory(category);
          return;
        }
      }

      // Fallback to get by ID
      const result = await categoryService.getCategoryById(categoryId);
      if (result.success && result.data) {
        setSelectedCategory(result.data);
      }
    } catch (err) {
      console.error('Error loading category info:', err);
    }
  };

  // Handle category selection from modal
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      categoryId: String(category.id)
    }));
    setIsCategoryModalOpen(false);
  };

  // Image handler for Quill editor - Upload from local
  const imageHandler = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    // Create input element for file selection
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.onchange = async () => {
      const file = input.files[0];
      
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB');
          return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          setError('Please select a valid image file');
          return;
        }
        
        // Convert to base64 for preview (in production, upload to server)
        const reader = new FileReader();
        reader.onload = (e) => {
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', e.target.result, 'user');
          editor.setSelection(range.index + 1);
          
          // Show info message
          setSuccess('Image inserted successfully. Note: For production, images should be uploaded to a server.');
          setTimeout(() => setSuccess(null), 5000);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  // Quill formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages on input
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Handle content change from Quill editor
  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
    
    // Clear messages on input
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = () => {
    // Mark all fields as touched when validation is attempted
    setTouchedFields({
      title: true,
      description: true,
      content: true,
      categoryId: true
    });

    // Validate title
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (formData.title.length < 10) {
      setError('Title must be at least 10 characters long');
      return false;
    }
    
    if (formData.title.length > 255) {
      setError('Title must not exceed 255 characters');
      return false;
    }

    // Validate description (optional but check max length if provided)
    if (formData.description && formData.description.length > 500) {
      setError('Description must not exceed 500 characters');
      return false;
    }
    
    // Validate content - strip HTML tags for validation
    const plainTextContent = formData.content.replace(/<[^>]*>/g, '').trim();
    
    if (!plainTextContent) {
      setError('Content is required');
      return false;
    }
    
    if (plainTextContent.length < 100) {
      setError('Content must be at least 100 characters long (excluding HTML tags)');
      return false;
    }

    // Validate category
    if (!formData.categoryId) {
      setError('Category is required');
      return false;
    }
    
    return true;
  };

  const handleSave = async (isDraft = true) => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare payload according to API spec
      // Support both JSON and Multipart upload
      const payload = {
        title: formData.title.trim(),
        content: formData.content,
        categoryId: Number(formData.categoryId)
      };

      // Add optional fields only if they have values
      if (formData.description && formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      // If we have a file to upload, use it for multipart
      // Otherwise, use URL if provided
      if (featuredImageFile && featuredImageFile instanceof File) {
        payload.featuredImageFile = featuredImageFile;
      } else if (formData.featuredImage && formData.featuredImage.trim()) {
        payload.featuredImage = formData.featuredImage.trim();
      }

      let result;
      
      if (article?.id) {
        // Update existing article (supports JSON or Multipart)
        result = await articleService.updateArticle(article.id, payload);
      } else {
        // Create new article (supports JSON or Multipart)
        result = await articleService.createArticle(payload);
      }
      
      if (result.success) {
        // If we uploaded a file, update featuredImage URL from response
        if (featuredImageFile && result.data?.featuredImage) {
          // Cleanup old blob URL if it was a preview
          if (formData.featuredImage && formData.featuredImage.startsWith('blob:')) {
            URL.revokeObjectURL(formData.featuredImage);
          }
          
          // Update with actual URL from server
          setFormData(prev => ({
            ...prev,
            featuredImage: result.data.featuredImage
          }));
          
          // Clear file after successful upload
          setFeaturedImageFile(null);
        }
        
        setSuccess(isDraft ? 'Article saved as draft successfully' : 'Article saved successfully');
        
        // Call onSave callback
        if (onSave) {
          onSave(result.data);
        }
      } else {
        setError(result.error || 'Failed to save article');
      }
    } catch (err) {
      console.error('Error saving article:', err);
      setError('An unexpected error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    // First save the article
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let savedArticle = article;
      
      // Prepare payload according to API spec
      // Support both JSON and Multipart upload
      const payload = {
        title: formData.title.trim(),
        content: formData.content,
        categoryId: Number(formData.categoryId)
      };

      // Add optional fields only if they have values
      if (formData.description && formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      // If we have a file to upload, use it for multipart
      // Otherwise, use URL if provided
      if (featuredImageFile && featuredImageFile instanceof File) {
        payload.featuredImageFile = featuredImageFile;
      } else if (formData.featuredImage && formData.featuredImage.trim()) {
        payload.featuredImage = formData.featuredImage.trim();
      }

      // If new article or has changes, save first
      if (!article?.id) {
        // Create new article (supports JSON or Multipart)
        const createResult = await articleService.createArticle(payload);
        
        if (!createResult.success) {
          setError(createResult.error || 'Failed to save article before submission');
          return;
        }
        
        savedArticle = createResult.data;
      } else {
        // Update existing article (supports JSON or Multipart)
        const updateResult = await articleService.updateArticle(article.id, payload);
        
        if (!updateResult.success) {
          setError(updateResult.error || 'Failed to update article before submission');
          return;
        }
        
        savedArticle = updateResult.data;
      }
      
      // Update featuredImage URL if we uploaded a file
      if (featuredImageFile && savedArticle?.featuredImage) {
        // Cleanup old blob URL if it was a preview
        if (formData.featuredImage && formData.featuredImage.startsWith('blob:')) {
          URL.revokeObjectURL(formData.featuredImage);
        }
        
        // Update with actual URL from server
        setFormData(prev => ({
          ...prev,
          featuredImage: savedArticle.featuredImage
        }));
        
        // Clear file after successful upload
        setFeaturedImageFile(null);
      }
      
      // Then submit for review
      const submitResult = await articleService.submitArticle(savedArticle.id);
      
      if (submitResult.success) {
        setSuccess('Article submitted for review successfully');
        
        // Call onSave callback
        if (onSave) {
          onSave(submitResult.data);
        }
      } else {
        setError(submitResult.error || 'Failed to submit article for review');
      }
    } catch (err) {
      console.error('Error submitting article:', err);
      setError('An unexpected error occurred while submitting');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Helper function to convert relative image URLs to absolute URLs
  // Note: Backend should have /api/v1/images/** in public endpoints for images to load
  const getImageUrl = (url) => {
    if (!url) return null;
    
    // If already absolute URL (http/https/blob), return as is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    
    // If relative URL, prepend base URL
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
    // Remove /api/v1 if present in baseURL since relative URLs might already include it
    const cleanBaseURL = baseURL.replace(/\/api\/v1$/, '');
    
    // Ensure URL starts with /
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBaseURL}${cleanUrl}`;
  };

  // Handle image upload
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/gif,image/webp');
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setError('File must be an image (JPEG, JPG, PNG, GIF, or WEBP)');
        return;
      }

      // Validate file size: max 10MB
      const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxFileSize) {
        setError('Image size must be less than 10MB');
        return;
      }

      setUploadingImage(true);
      setError(null);

      try {
        let imageUrl = null;

        setFeaturedImageFile(file);
        
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,  
          featuredImage: previewUrl
        }));
        
        setSuccess('Image selected. File will be uploaded when you save the article.');
      } catch (err) {
        console.error('Error uploading image:', err);
        setError(err.response?.data?.message || err.message || 'Failed to upload image. Please try again or use a URL instead.');
      } finally {
        setUploadingImage(false);
      }
    };
    
    input.click();
  };

  // Handle remove featured image
  const handleRemoveImage = () => {
    // Cleanup blob URL if it's a preview
    if (formData.featuredImage && formData.featuredImage.startsWith('blob:')) {
      URL.revokeObjectURL(formData.featuredImage);
    }
    
    setFormData(prev => ({
      ...prev,
      featuredImage: ''
    }));
    setFeaturedImageFile(null);
    setSuccess('Image removed');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {article?.id ? 'Edit Article' : 'Create New Article'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the details below to {article?.id ? 'update' : 'create'} your article
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-6 mt-4">
          <Alert variant="error" title="Error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}
      
      {success && (
        <div className="mx-6 mt-4">
          <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        </div>
      )}

      {/* Form */}
      <div className="px-6 py-6 space-y-6">
        {/* Title */}
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter article title (10-255 characters)"
          required
          disabled={loading}
          helperText={`${formData.title.length}/255 characters (min. 10 required)`}
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={selectedCategory ? selectedCategory.name : 'No category selected'}
                placeholder="Select a category"
                readOnly
                disabled={loading}
                onClick={() => !loading && setIsCategoryModalOpen(true)}
                className="cursor-pointer"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsCategoryModalOpen(true)}
              disabled={loading}
              title="Select category"
            >
              <FolderTree className="h-5 w-5" />
            </Button>
          </div>
          {selectedCategory && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedCategory.description || 'Category selected'}
            </p>
          )}
          {touchedFields.categoryId && !formData.categoryId && (
            <p className="mt-1 text-sm text-red-500">
              Category is required
            </p>
          )}
        </div>

        {/* Category Picker Modal */}
        <CategoryPickerModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          selectedCategoryId={formData.categoryId ? Number(formData.categoryId) : null}
          onSelect={handleCategorySelect}
        />

        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief summary of the article (optional, max 500 characters)"
          rows={3}
          disabled={loading}
          helperText={`${formData.description.length}/500 characters`}
        />

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                placeholder="Image URL or upload from local"
                disabled={loading || uploadingImage}
              />
            </div>
            <Button
              variant="secondary"
              disabled={loading || uploadingImage}
              onClick={handleImageUpload}
              title="Upload image"
            >
              {uploadingImage ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </Button>
          </div>
          {formData.featuredImage && (
            <div className="mt-3 relative">
              <div className="relative bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center overflow-auto">
                <img 
                  src={getImageUrl(formData.featuredImage)} 
                  alt="Preview" 
                  className="max-w-full h-auto object-contain rounded-lg"
                  style={{ maxHeight: '600px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors z-10"
                  title="Remove image"
                  disabled={loading || uploadingImage}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Upload an image or enter an image URL. Allowed formats: JPEG, JPG, PNG, GIF, WEBP. Max file size: 10MB
          </p>
        </div>

        {/* Content - Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              placeholder="Write your article content here (min. 100 characters)..."
              className="bg-white"
              readOnly={loading}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {formData.content.replace(/<[^>]*>/g, '').length} characters (min. 100 required)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={handleCancel}
          disabled={loading}
        >
          <X className="h-5 w-5 mr-2" />
          Cancel
        </Button>
        
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => handleSave(true)}
            disabled={loading}
            isLoading={loading}
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save as Draft'}
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            isLoading={loading}
          >
            <Send className="h-5 w-5 mr-2" />
            {loading ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ArticleEditor;

