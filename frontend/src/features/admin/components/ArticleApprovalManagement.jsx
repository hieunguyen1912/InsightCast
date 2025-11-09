/**
 * Article Approval Management Component
 * Admin component for approving/rejecting articles from moderators
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  Search as SearchIcon,
  FileText,
  Clock,
  User
} from 'lucide-react';
import { Button, Input, Spinner, Alert, ConfirmModal } from '../../../components/common';
import adminService from '../api';
import articleService from '../../moderator/api';
import ArticleViewModal from '../../moderator/components/ArticleViewModal';

/**
 * ArticleApprovalManagement component
 * @param {Object} props
 * @param {Function} props.onStatsChange - Callback when stats change
 */
function ArticleApprovalManagement({ onStatsChange }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewingArticle, setViewingArticle] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [approveConfirmation, setApproveConfirmation] = useState({ isOpen: false, articleId: null, articleTitle: '' });
  const [rejectConfirmation, setRejectConfirmation] = useState({ isOpen: false, articleId: null, articleTitle: '', reason: '' });

  useEffect(() => {
    loadPendingArticles();
  }, [currentPage]);

  const loadPendingArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminService.getPendingArticles({
        page: currentPage,
        size: 10
      });
      
      if (result.success) {
        const data = result.data?.data || result.data || {};
        const articleList = data.content || data.items || data || [];
        setArticles(Array.isArray(articleList) ? articleList : []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setError(result.error || 'Failed to load pending articles');
        setArticles([]);
      }
    } catch (err) {
      console.error('Error loading pending articles:', err);
      setError('An unexpected error occurred');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (articleId, articleTitle) => {
    setApproveConfirmation({
      isOpen: true,
      articleId,
      articleTitle
    });
  };

  const handleApproveConfirm = async () => {
    if (!approveConfirmation.articleId) return;
    
    try {
      const result = await adminService.approveArticle(approveConfirmation.articleId);
      
      if (result.success) {
        await loadPendingArticles();
        setApproveConfirmation({ isOpen: false, articleId: null, articleTitle: '' });
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to approve article');
      }
    } catch (err) {
      console.error('Error approving article:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleApproveCancel = () => {
    setApproveConfirmation({ isOpen: false, articleId: null, articleTitle: '' });
  };

  const handleRejectClick = (articleId, articleTitle) => {
    setRejectConfirmation({
      isOpen: true,
      articleId,
      articleTitle,
      reason: ''
    });
  };

  const handleRejectConfirm = async () => {
    if (!rejectConfirmation.articleId) return;
    
    // Validate rejection reason
    const reason = rejectConfirmation.reason?.trim() || '';
    if (reason.length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }
    if (reason.length > 1000) {
      setError('Rejection reason must not exceed 1000 characters');
      return;
    }
    
    try {
      const result = await adminService.rejectArticle(
        rejectConfirmation.articleId,
        reason
      );
      
      if (result.success) {
        await loadPendingArticles();
        setRejectConfirmation({ isOpen: false, articleId: null, articleTitle: '', reason: '' });
        if (onStatsChange) onStatsChange();
        setError(null);
      } else {
        setError(result.error || 'Failed to reject article');
      }
    } catch (err) {
      console.error('Error rejecting article:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleRejectCancel = () => {
    setRejectConfirmation({ isOpen: false, articleId: null, articleTitle: '', reason: '' });
  };

  const getAuthorName = (article) => {
    if (article.authorName) return article.authorName;
    if (typeof article.author === 'string') return article.author;
    if (article.author && typeof article.author === 'object') {
      return article.author.username || 
             `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() || 
             article.author.email ||
             'Anonymous';
    }
    return 'Anonymous';
  };

  const getCategoryName = (article) => {
    return article.categoryName || article.category?.name || 'Uncategorized';
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const authorName = getAuthorName(article);
    const categoryName = getCategoryName(article);
    return (
      article.title?.toLowerCase().includes(searchLower) ||
      authorName.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower)
    );
  });

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={loadPendingArticles}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Articles</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'No articles match your search criteria' 
              : 'All articles have been reviewed. No pending articles.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured Image
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {article.title}
                        </p>
                        {article.excerpt && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {getAuthorName(article)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getCategoryName(article)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(article.updatedAt || article.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(article.featuredImage || article.imageUrl) ? (
                        <img 
                          src={getImageUrl(article.featuredImage || article.imageUrl)} 
                          alt={article.title}
                          className="w-20 h-20 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setViewingArticle(article);
                            setIsViewModalOpen(true);
                          }}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View article"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleApproveClick(article.id, article.title)}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve article"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleRejectClick(article.id, article.title)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject article"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredArticles.length} of {totalElements} pending article{totalElements !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Article View Modal */}
      <ArticleViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingArticle(null);
        }}
        articleId={viewingArticle}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={approveConfirmation.isOpen}
        onClose={handleApproveCancel}
        onConfirm={handleApproveConfirm}
        title="Approve Article"
        message={
          <div className="space-y-2">
            <p className="text-gray-700">
              Are you sure you want to approve <strong>"{approveConfirmation.articleTitle}"</strong>?
            </p>
            <p className="text-sm text-green-600 font-medium">
              This article will be published and visible to all users.
            </p>
          </div>
        }
        confirmText="Approve"
        cancelText="Cancel"
        variant="primary"
      />

      {/* Reject Confirmation Modal */}
      {rejectConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Article</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 mb-2">
                  Are you sure you want to reject <strong>"{rejectConfirmation.articleTitle}"</strong>?
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectConfirmation.reason}
                  onChange={(e) => {
                    setRejectConfirmation({ ...rejectConfirmation, reason: e.target.value });
                    setError(null); // Clear error when user types
                  }}
                  placeholder="Enter reason for rejection (minimum 10 characters)..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    rejectConfirmation.reason && rejectConfirmation.reason.trim().length > 0 && 
                    rejectConfirmation.reason.trim().length < 10 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  }`}
                  rows="4"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${
                    rejectConfirmation.reason && rejectConfirmation.reason.trim().length > 0 && 
                    rejectConfirmation.reason.trim().length < 10 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    {rejectConfirmation.reason && rejectConfirmation.reason.trim().length > 0 && 
                     rejectConfirmation.reason.trim().length < 10 
                      ? `Minimum 10 characters required (${rejectConfirmation.reason.trim().length}/10)`
                      : `${rejectConfirmation.reason?.length || 0}/1000 characters`
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleRejectCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={
                    !rejectConfirmation.reason || 
                    rejectConfirmation.reason.trim().length < 10 || 
                    rejectConfirmation.reason.trim().length > 1000
                  }
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleApprovalManagement;

