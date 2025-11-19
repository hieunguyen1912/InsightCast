/**
 * Admin Articles Management Component
 * Comprehensive article management for Admin with filters, tabs, and actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search as SearchIcon,
  FileText,
  Clock,
  User,
  Filter,
  X
} from 'lucide-react';
import { Button, Input, Spinner, Alert, StatusBadge, ConfirmModal } from '../../../components/common';
import adminService from '../api';
import ArticleViewModal from '../../moderator/components/ArticleViewModal';

/**
 * AdminArticlesManagement component
 * @param {Object} props
 * @param {Function} props.onStatsChange - Callback when stats change
 */
function AdminArticlesManagement({ onStatsChange }) {
  const navigate = useNavigate();
  
  // Tab state - default to 'pending' for article approval workflow
  const [activeTab, setActiveTab] = useState('pending');
  
  // Data state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    categoryName: '',
    authorName: '',
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [viewingArticle, setViewingArticle] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [approveConfirmation, setApproveConfirmation] = useState({ isOpen: false, articleId: null, articleTitle: '' });
  const [rejectConfirmation, setRejectConfirmation] = useState({ isOpen: false, articleId: null, articleTitle: '', reason: '' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, articleId: null, articleTitle: '' });

  // Load articles based on active tab and filters
  useEffect(() => {
    loadArticles();
  }, [activeTab, currentPage, pageSize, filters]);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      };

      // Add filters if provided
      if (filters.status) params.status = filters.status;
      if (filters.categoryName) params.categoryName = filters.categoryName;
      if (filters.authorName) params.authorName = filters.authorName;

      switch (activeTab) {
        case 'all':
          result = await adminService.getAllArticles(params);
          break;
        case 'approved':
          result = await adminService.getApprovedArticles(params);
          break;
        case 'rejected':
          result = await adminService.getRejectedArticles(params);
          break;
        case 'drafts':
          result = await adminService.getDraftArticles(params);
          break;
        case 'pending':
          result = await adminService.getPendingArticles(params);
          break;
        default:
          result = await adminService.getAllArticles(params);
      }
      
      if (result.success) {
        const data = result.data?.data || result.data || {};
        const articleList = data.content || data.items || data || [];
        setArticles(Array.isArray(articleList) ? articleList : []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setError(result.error || 'Failed to load articles');
        setArticles([]);
      }
    } catch (err) {
      console.error('Error loading articles:', err);
      setError('An unexpected error occurred');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    // Update status filter based on tab
    if (tab === 'approved') {
      setFilters(prev => ({ ...prev, status: 'APPROVED' }));
    } else if (tab === 'rejected') {
      setFilters(prev => ({ ...prev, status: 'REJECTED' }));
    } else if (tab === 'drafts') {
      setFilters(prev => ({ ...prev, status: 'DRAFT' }));
    } else if (tab === 'pending') {
      setFilters(prev => ({ ...prev, status: 'PENDING_REVIEW' }));
    } else {
      setFilters(prev => ({ ...prev, status: '' }));
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      categoryName: '',
      authorName: '',
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });
    setCurrentPage(0);
  };

  const handleView = (article) => {
    setViewingArticle(article.id);
    setIsViewModalOpen(true);
  };

  const handleEdit = (article) => {
    // Navigate to edit page
    navigate(`/admin/articles/${article.id}/edit`);
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
        await loadArticles();
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
        await loadArticles();
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

  const handleDeleteClick = (articleId, articleTitle) => {
    setDeleteConfirmation({
      isOpen: true,
      articleId,
      articleTitle
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.articleId) return;
    
    try {
      const result = await adminService.deleteArticle(deleteConfirmation.articleId);
      
      if (result.success) {
        await loadArticles();
        setDeleteConfirmation({ isOpen: false, articleId: null, articleTitle: '' });
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to delete article');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('An unexpected error occurred');
    }
  };


  // Helper functions
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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const tabs = [
    { id: 'all', label: 'All Articles' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'pending', label: 'Pending Review' }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Articles Management</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showFilters 
                  ? 'bg-orange-500 text-white border-orange-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={loadArticles}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter (only for 'all' tab) */}
            {activeTab === 'all' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            )}

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={filters.categoryName}
                onChange={(e) => handleFilterChange('categoryName', e.target.value)}
                placeholder="Search category..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={filters.authorName}
                onChange={(e) => handleFilterChange('authorName', e.target.value)}
                placeholder="Search author..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="publishedAt">Published Date</option>
                <option value="title">Title</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={filters.sortDirection}
                onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Articles Table */}
      {loading && articles.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <Spinner />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Found</h3>
          <p className="text-gray-600">
            {activeTab === 'all' 
              ? 'No articles match your filters' 
              : `No ${activeTab} articles found`
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {article.title}
                        </p>
                        {article.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {article.description}
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
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(article.publishedAt || article.createdAt)}
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
                          onClick={() => handleView(article)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View article"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit article"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {article.status === 'PENDING_REVIEW' && (
                          <>
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
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDeleteClick(article.id, article.title)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Showing {articles.length} of {totalElements} article{totalElements !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0 || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 px-4">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1 || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        useAdminApi={true}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={approveConfirmation.isOpen}
        onClose={() => setApproveConfirmation({ isOpen: false, articleId: null, articleTitle: '' })}
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
                    setError(null);
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
                  onClick={() => setRejectConfirmation({ isOpen: false, articleId: null, articleTitle: '', reason: '' })}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, articleId: null, articleTitle: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        message={
          <div className="space-y-2">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>"{deleteConfirmation.articleTitle}"</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default AdminArticlesManagement;

