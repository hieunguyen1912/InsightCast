import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Send, X, Image as ImageIcon, Upload, FolderTree, Sparkles } from 'lucide-react';
import { Button, Input, Textarea, Alert } from '../../../components/common';
import articleService from '../api';
import categoryService from '../../category/api';
import apiClient from '../../../services/axiosClient';
import CategoryPickerModal from './CategoryPickerModal';

function ArticleEditor({ article = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    content: '',
    featuredImage: '',
    categoryId: ''
  });
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSummaryConfigModalOpen, setIsSummaryConfigModalOpen] = useState(false);
  const [summaryConfig, setSummaryConfig] = useState({
    maxLength: 200,
    language: 'vi'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [featuredImageFile, setFeaturedImageFile] = useState(null); // Store file for multipart upload
  const [contentImageUrls, setContentImageUrls] = useState([]); // Store content image URLs
  const quillRef = useRef(null);

  // Helper function to convert relative image URLs to absolute URLs
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

  // Helper function to convert image URLs in content to absolute URLs
  const processContentImageUrls = (content) => {
    if (!content) return content;
    
    // Match all img tags with src attribute
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    
    return content.replace(imgRegex, (match, src) => {
      // If already absolute URL (http/https/blob/data), keep as is
      if (src.startsWith('http://') || src.startsWith('https://') || 
          src.startsWith('blob:') || src.startsWith('data:')) {
        return match;
      }
      
      // Convert relative URL to absolute
      const absoluteUrl = getImageUrl(src);
      return match.replace(src, absoluteUrl);
    });
  };

  // Load article data if editing
  useEffect(() => {
    if (article) {
      const categoryId = article.categoryId || article.category?.id || '';
      
      // Process content to ensure images are displayed correctly
      let processedContent = article.content || '';
      
      // If content has placeholders and we have contentImageUrls, replace them
      if (article.contentImageUrls && Array.isArray(article.contentImageUrls) && article.contentImageUrls.length > 0) {
        setContentImageUrls(article.contentImageUrls);
        
        // Replace placeholders with actual URLs if content has placeholders
        article.contentImageUrls.forEach((url, index) => {
          const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
          if (processedContent.includes(placeholder)) {
            processedContent = processedContent.replace(placeholder, url);
          }
        });
      } else {
        setContentImageUrls([]);
      }
      
      // Convert all image URLs in content to absolute URLs for proper display in editor
      processedContent = processContentImageUrls(processedContent);
      
      setFormData({
        title: article.title || '',
        description: article.description || '',
        summary: article.summary || '',
        content: processedContent,
        featuredImage: article.featuredImage || '',
        categoryId: categoryId
      });

      // Load category info if categoryId exists
      if (categoryId) {
        loadCategoryInfo(categoryId);
      }
    } else {
      // Reset contentImageUrls when creating new article
      setContentImageUrls([]);
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

  // Image handler for Quill editor - Upload to server immediately
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
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('Image size must be less than 10MB');
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

  // Convert base64 data URL to File object
  const base64ToFile = (base64String, filename = 'image.png') => {
    try {
      const arr = base64String.split(',');
      if (arr.length !== 2) {
        throw new Error('Invalid base64 string');
      }
      
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) {
        throw new Error('Invalid mime type');
      }
      
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      // Generate filename with extension based on mime type
      const extension = mime.split('/')[1] || 'png';
      const finalFilename = filename.includes('.') ? filename : `${filename}.${extension}`;
      
      return new File([u8arr], finalFilename, { type: mime });
    } catch (err) {
      console.error('Error converting base64 to file:', err);
      return null;
    }
  };

  // Extract base64 images from content and convert to File objects
  const extractContentImages = (content) => {
    if (!content) return { files: [], updatedContent: content };
    
    const base64Regex = /src=["'](data:image\/([^;]+);base64,([^"']+))["']/g;
    const matches = [...content.matchAll(base64Regex)];
    
    if (matches.length === 0) {
      return { files: [], updatedContent: content };
    }
    
    const files = [];
    const placeholders = new Map(); // Map base64 -> placeholder
    
    matches.forEach((match, index) => {
      const fullBase64 = match[1]; // data:image/png;base64,...
      const imageType = match[2]; // png, jpeg, etc.
      const base64Data = match[3]; // actual base64 data
      
      // Convert to File
      const file = base64ToFile(fullBase64, `content-image-${index + 1}.${imageType}`);
      
      if (file) {
        files.push(file);
        // Create placeholder that will be replaced by backend with actual URL
        // Backend should return image URLs in the same order
        placeholders.set(fullBase64, `__IMAGE_PLACEHOLDER_${index}__`);
      }
    });
    
    // Replace base64 with placeholders temporarily
    // Backend will replace these with actual URLs
    let updatedContent = content;
    placeholders.forEach((placeholder, base64) => {
      updatedContent = updatedContent.replace(base64, placeholder);
    });
    
    return { files, updatedContent, placeholders };
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
      // Extract base64 images from content
      const { files: contentImageFiles, updatedContent, placeholders } = extractContentImages(formData.content);
      
      // Prepare payload according to API spec
      // Support both JSON and Multipart upload
      const payload = {
        title: formData.title.trim(),
        content: updatedContent, // Content with placeholders
        categoryId: Number(formData.categoryId)
      };

      // Add optional fields only if they have values
      if (formData.description && formData.description.trim()) {
        payload.description = formData.description.trim();
      }
      if (formData.summary && formData.summary.trim()) {
        payload.summary = formData.summary.trim();
      }

      // If we have a file to upload, use it for multipart
      // Otherwise, use URL if provided
      if (featuredImageFile && featuredImageFile instanceof File) {
        payload.featuredImageFile = featuredImageFile;
      } else if (formData.featuredImage && formData.featuredImage.trim()) {
        payload.featuredImage = formData.featuredImage.trim();
      }

      // Add content images if any
      if (contentImageFiles.length > 0) {
        payload.contentImages = contentImageFiles;
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
        // Replace placeholders with actual URLs from backend response
        let finalContent = updatedContent;
        if (result.data?.contentImageUrls && Array.isArray(result.data.contentImageUrls)) {
          result.data.contentImageUrls.forEach((url, index) => {
            const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
            finalContent = finalContent.replace(placeholder, url);
          });
        }
        
        // Update content with actual URLs
        setFormData(prev => ({
          ...prev,
          content: finalContent
        }));
        
        // Update contentImageUrls from response
        if (result.data?.contentImageUrls && Array.isArray(result.data.contentImageUrls)) {
          setContentImageUrls(result.data.contentImageUrls);
        }
        
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
      // Extract base64 images from content
      const { files: contentImageFiles, updatedContent, placeholders } = extractContentImages(formData.content);
      
      // Prepare payload according to API spec
      // Support both JSON and Multipart upload
      const payload = {
        title: formData.title.trim(),
        content: updatedContent, // Content with placeholders
        categoryId: Number(formData.categoryId)
      };

      // Add optional fields only if they have values
      if (formData.description && formData.description.trim()) {
        payload.description = formData.description.trim();
      }
      if (formData.summary && formData.summary.trim()) {
        payload.summary = formData.summary.trim();
      }

      // If we have a file to upload, use it for multipart
      // Otherwise, use URL if provided
      if (featuredImageFile && featuredImageFile instanceof File) {
        payload.featuredImageFile = featuredImageFile;
      } else if (formData.featuredImage && formData.featuredImage.trim()) {
        payload.featuredImage = formData.featuredImage.trim();
      }

      // Add content images if any
      if (contentImageFiles.length > 0) {
        payload.contentImages = contentImageFiles;
      }

      let savedArticle = article;
      
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
      
      // Replace placeholders with actual URLs from backend response
      let finalContent = updatedContent;
      if (savedArticle?.contentImageUrls && Array.isArray(savedArticle.contentImageUrls)) {
        savedArticle.contentImageUrls.forEach((url, index) => {
          const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
          finalContent = finalContent.replace(placeholder, url);
        });
      }
      
      // Update content with actual URLs
      setFormData(prev => ({
        ...prev,
        content: finalContent
      }));
      
      // Update contentImageUrls from response
      if (savedArticle?.contentImageUrls && Array.isArray(savedArticle.contentImageUrls)) {
        setContentImageUrls(savedArticle.contentImageUrls);
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

  // Handle open generate summary config modal
  const handleOpenGenerateSummary = () => {
    // Check if content exists
    const plainTextContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!plainTextContent || plainTextContent.length < 100) {
      setError('Please add content (at least 100 characters) before generating summary');
      return;
    }

    setError(null); // Clear any previous errors
    setIsSummaryConfigModalOpen(true);
  };

  // Handle generate summary with config
  const handleGenerateSummary = async () => {
    // Validate maxLength
    if (!summaryConfig.maxLength || summaryConfig.maxLength < 50 || summaryConfig.maxLength > 1000) {
      setError('Max length must be between 50 and 1000 words');
      // Keep modal open for user to fix
      return;
    }

    // Validate language
    if (!summaryConfig.language) {
      setError('Please select a language');
      // Keep modal open for user to fix
      return;
    }

    setGeneratingSummary(true);
    setError(null);
    setSuccess(null);
    setIsSummaryConfigModalOpen(false);

    try {
      const result = await articleService.generateSummary(
        formData.content,
        summaryConfig.maxLength,
        summaryConfig.language
      );

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          summary: result.data || ''
        }));
        setSuccess('Summary generated successfully');
      } else {
        setError(result.error || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('An unexpected error occurred while generating summary');
    } finally {
      setGeneratingSummary(false);
    }
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

        {/* Summary Generate Config Modal */}
        {isSummaryConfigModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              if (!generatingSummary) {
                setError(null);
                setIsSummaryConfigModalOpen(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Generate Summary Configuration</h3>
                <p className="text-sm text-gray-600 mt-1">Configure settings for AI summary generation</p>
              </div>
              
              {error && (
                <div className="mx-6 mt-4">
                  <Alert variant="error" title="Error" dismissible onDismiss={() => setError(null)}>
                    {error}
                  </Alert>
                </div>
              )}
              
              <div className="px-6 py-4 space-y-4">
                {/* Max Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Length (words) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="50"
                    max="1000"
                    value={summaryConfig.maxLength}
                    onChange={(e) => setSummaryConfig(prev => ({
                      ...prev,
                      maxLength: parseInt(e.target.value) || 200
                    }))}
                    placeholder="200"
                    disabled={generatingSummary}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of words in the summary (50-1000, default: 200)
                  </p>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={summaryConfig.language}
                    onChange={(e) => setSummaryConfig(prev => ({
                      ...prev,
                      language: e.target.value
                    }))}
                    disabled={generatingSummary}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="vi">Tiếng Việt (Vietnamese)</option>
                    <option value="en">English</option>
                    <option value="zh">中文 (Chinese)</option>
                    <option value="ja">日本語 (Japanese)</option>
                    <option value="ko">한국어 (Korean)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="es">Español (Spanish)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Language for the generated summary
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setIsSummaryConfigModalOpen(false);
                  }}
                  disabled={generatingSummary}
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  isLoading={generatingSummary}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {generatingSummary ? 'Generating...' : 'Generate Summary'}
                </Button>
              </div>
            </div>
          </div>
        )}

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

        {/* Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Summary <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <Button
              variant="secondary"
              onClick={handleOpenGenerateSummary}
              disabled={loading || generatingSummary || !formData.content}
              isLoading={generatingSummary}
              title="Generate summary using AI (Gemini)"
              className="whitespace-nowrap"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {generatingSummary ? 'Generating...' : 'Generate'}
            </Button>
          </div>
          <Textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Article summary (you can write manually or generate automatically using AI)"
            rows={6}
            disabled={loading || generatingSummary}
            helperText={`${formData.summary.length} characters`}
            className="text-base"
          />
          <p className="mt-1 text-sm text-gray-500">
            Write a summary manually or click "Generate" to create one automatically from your content using AI
          </p>
        </div>

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
            {contentImageUrls && contentImageUrls.length > 0 && (
              <span className="ml-2 text-gray-400">
                • {contentImageUrls.length} image{contentImageUrls.length > 1 ? 's' : ''} embedded in content
              </span>
            )}
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

