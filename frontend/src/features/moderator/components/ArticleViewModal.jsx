/**
 * Article View Modal Component
 * Displays article detail in a modal dialog
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Eye, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import DOMPurify from 'dompurify';
import articleService from '../api';
import adminService from '../../admin/api';
import { formatNewsTime, formatDate } from '../../../utils/formatTime';

/**
 * ArticleViewModal component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Object|number} props.articleId - Article ID or article object
 * @param {boolean} props.useAdminApi - Use admin API instead of moderator API (default: false)
 */
function ArticleViewModal({ isOpen, onClose, articleId, useAdminApi = false }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && articleId) {
      loadArticleDetail();
    } else {
      // Reset state when modal closes
      setArticle(null);
      setError(null);
    }
  }, [isOpen, articleId]);

  const loadArticleDetail = async () => {
    const id = typeof articleId === 'object' ? articleId.id : articleId;
    
    if (!id) {
      setError('Article ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Use admin API if useAdminApi prop is true, otherwise use moderator API
      const result = useAdminApi 
        ? await adminService.getArticleById(id)
        : await articleService.getArticleById(id);
      
      if (result.success) {
        setArticle(result.data);
      } else {
        setError(result.error || 'Failed to load article');
      }
    } catch (err) {
      console.error('Error loading article:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getAuthorName = (article) => {
    if (article?.authorName) return article.authorName;
    if (typeof article?.author === 'string') return article.author;
    if (article?.author && typeof article.author === 'object') {
      return article.author.username || 
             `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() || 
             article.author.email ||
             'Anonymous';
    }
    return 'Anonymous';
  };

  const getCategoryName = (article) => {
    return article?.categoryName || article?.category?.name || 'Uncategorized';
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

  // Helper function to process content and ensure images display correctly
  const processContent = (content, contentImageUrls) => {
    if (!content) return content;
    
    let processedContent = content;
    
    // Replace placeholders with actual URLs if content has placeholders
    if (contentImageUrls && Array.isArray(contentImageUrls) && contentImageUrls.length > 0) {
      contentImageUrls.forEach((url, index) => {
        const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
        if (processedContent.includes(placeholder)) {
          processedContent = processedContent.replace(placeholder, url);
        }
      });
    }
    
    // Convert all relative image URLs to absolute URLs
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    processedContent = processedContent.replace(imgRegex, (match, src) => {
      // If already absolute URL (http/https/blob/data), keep as is
      if (src.startsWith('http://') || src.startsWith('https://') || 
          src.startsWith('blob:') || src.startsWith('data:')) {
        return match;
      }
      
      // Convert relative URL to absolute
      const absoluteUrl = getImageUrl(src);
      return match.replace(src, absoluteUrl);
    });
    
    return processedContent;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { icon: FileText, bgColor: 'bg-gray-100', textColor: 'text-gray-700', label: 'Draft' },
      PENDING_REVIEW: { icon: Clock, bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', label: 'Pending Review' },
      APPROVED: { icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-700', label: 'Approved' },
      REJECTED: { icon: XCircle, bgColor: 'bg-red-100', textColor: 'text-red-700', label: 'Rejected' },
      PUBLISHED: { icon: CheckCircle, bgColor: 'bg-blue-100', textColor: 'text-blue-700', label: 'Published' }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Article Detail</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                  onClick={loadArticleDetail}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : article ? (
              <article>
                {/* Status Badge */}
                <div className="mb-4">
                  {getStatusBadge(article.status)}
                </div>

                {/* Category */}
                <div className="mb-4">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {getCategoryName(article)}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>

                {/* Description */}
                {article.description && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {article.description}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{getAuthorName(article)}</span>
                  </div>
                  {article.publishedAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  )}
                  {article.updatedAt && (
                    <div className="flex items-center">
                      <span>Updated: {formatNewsTime(article.updatedAt)}</span>
                    </div>
                  )}
                  {article.viewCount !== undefined && (
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      <span>{article.viewCount || 0} views</span>
                    </div>
                  )}
                </div>

                {/* Featured Image */}
                {article.featuredImage && (
                  <div className="mb-6">
                    <img
                      src={getImageUrl(article.featuredImage)}
                      alt={article.title}
                      className="w-full max-h-[600px] object-contain rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Rejection Reason (if rejected) */}
                {article.status === 'REJECTED' && article.rejectionReason && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason:</h3>
                    <p className="text-sm text-red-700">{article.rejectionReason}</p>
                  </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {article.content ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(
                          processContent(article.content, article.contentImageUrls), 
                          {
                            ADD_TAGS: ['iframe'],
                            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
                          }
                        ) 
                      }} 
                    />
                  ) : (
                    <p className="text-gray-600">No content available.</p>
                  )}
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleViewModal;

