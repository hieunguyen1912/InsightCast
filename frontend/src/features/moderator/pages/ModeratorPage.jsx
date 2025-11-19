/**
 * Moderator Page
 * Main page for MODERATOR role to manage articles
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../../hooks/useRole';
import { FilePlus } from 'lucide-react';
import ModeratorSidebar from '../components/ModeratorSidebar';
import ModeratorOverview from '../components/ModeratorOverview';
import ArticleEditor from '../components/ArticleEditor';
import ArticleListManagement from '../components/ArticleListManagement';
import articleService from '../api';

function ModeratorPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { hasRole } = useRole(['MODERATOR', 'ADMIN']);
  
  const [activeModule, setActiveModule] = useState('overview');
  const [stats, setStats] = useState({
    all: 0,
    drafts: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  });
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user has MODERATOR or ADMIN role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Kiểm tra quyền MODERATOR hoặc ADMIN - nếu không có quyền sẽ bị RoleProtectedRoute redirect
    if (!hasRole) {
      navigate('/');
      return;
    }
    
    loadStats();
  }, [isAuthenticated, hasRole, navigate]);

  // Helper function to extract total count from API response
  const getTotalCount = (result) => {
    if (!result.success) return 0;
    
    // Handle nested response structure: result.data.data
    const responseData = result.data?.data || result.data;
    
    // If response has totalElements (paginated response), use it
    if (responseData?.totalElements !== undefined) {
      return responseData.totalElements;
    }
    
    // Fallback: count items in array (for backward compatibility)
    if (Array.isArray(responseData)) {
      return responseData.length;
    }
    
    // Alternative structure: items array
    if (Array.isArray(responseData?.items)) {
      return responseData.items.length;
    }
    
    // Alternative structure: content array
    if (Array.isArray(responseData?.content)) {
      return responseData.content.length;
    }
    
    return 0;
  };

  // Load statistics
  const loadStats = async () => {
    setLoading(true);
    
    try {
      // Load all article lists to calculate stats
      // Use size: 1 to minimize data transfer since we only need totalElements
      const [allResult, draftsResult, submittedResult, approvedResult, rejectedResult] = await Promise.all([
        articleService.getMyAll({ page: 0, size: 1 }),
        articleService.getMyDrafts({ page: 0, size: 1 }),
        articleService.getMySubmitted({ page: 0, size: 1 }),
        articleService.getMyApproved({ page: 0, size: 1 }),
        articleService.getMyRejected({ page: 0, size: 1 })
      ]);

      setStats({
        all: getTotalCount(allResult),
        drafts: getTotalCount(draftsResult),
        submitted: getTotalCount(submittedResult),
        approved: getTotalCount(approvedResult),
        rejected: getTotalCount(rejectedResult)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = (module) => {
    setActiveModule(module);
    setSelectedArticle(null);
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setActiveModule('create');
  };

  const handleViewArticle = (article) => {
    // Navigate to article detail page
    navigate(`/article/${article.id}`);
  };

  const handleArticleSaved = () => {
    // Reload stats and reset to overview or list
    loadStats();
    setSelectedArticle(null);
    setActiveModule('all');
  };

  const handleCancelEdit = () => {
    setSelectedArticle(null);
    setActiveModule('overview');
  };

  // Render active module content
  const renderContent = () => {
    switch (activeModule) {
      case 'overview':
        return (
          <ModeratorOverview 
            stats={stats}
            onNavigate={handleModuleChange}
          />
        );
      
      case 'create':
        return (
          <ArticleEditor
            article={selectedArticle}
            onSave={handleArticleSaved}
            onCancel={handleCancelEdit}
          />
        );
      
      case 'all':
      case 'drafts':
      case 'submitted':
      case 'approved':
      case 'rejected':
        return (
          <ArticleListManagement
            filter={activeModule}
            onEdit={handleEditArticle}
            onView={handleViewArticle}
          />
        );
      
      default:
        return (
          <ModeratorOverview 
            stats={stats}
            onNavigate={handleModuleChange}
          />
        );
    }
  };

  const getPageTitle = () => {
    const titles = {
      overview: 'Overview',
      create: selectedArticle ? 'Edit Article' : 'Create New Article',
      all: 'All Articles',
      drafts: 'Draft Articles',
      submitted: 'Submitted Articles',
      approved: 'Approved Articles',
      rejected: 'Rejected Articles'
    };
    
    return titles[activeModule] || 'Moderator Dashboard';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">Please login to access the moderator dashboard.</p>
            <button 
              onClick={() => navigate('/login')} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex max-w-full mx-auto min-h-[calc(100vh-5rem)]">
        {/* Sidebar Navigation */}
        <ModeratorSidebar 
          activeModule={activeModule}
          onModuleChange={handleModuleChange}
          stats={stats}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto" role="main">
          <div className="flex items-center justify-between mb-6 lg:mb-8 gap-4 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-4">
              {activeModule !== 'create' && (
                <button
                  onClick={() => handleModuleChange('create')}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors"
                >
                  <FilePlus className="h-5 w-5" />
                  <span className="hidden sm:inline">Create New Article</span>
                  <span className="sm:hidden">Create</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="animate-fade-in">
            {loading && activeModule === 'overview' ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ModeratorPage;

