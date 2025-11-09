/**
 * Moderator Page
 * Main page for MODERATOR role to manage articles
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FilePlus } from 'lucide-react';
import ModeratorSidebar from '../components/ModeratorSidebar';
import ModeratorOverview from '../components/ModeratorOverview';
import ArticleEditor from '../components/ArticleEditor';
import ArticleListManagement from '../components/ArticleListManagement';
import articleService from '../api';

function ModeratorPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
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

  // Check if user has MODERATOR role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // TODO: Add proper role check when user object includes roles
    // For now, we assume authenticated users can access moderator page
    // In production, you should check: user.roles?.includes('MODERATOR')
    
    loadStats();
  }, [isAuthenticated, navigate]);

  // Load statistics
  const loadStats = async () => {
    setLoading(true);
    
    try {
      // Load all article lists to calculate stats
      const [allResult, draftsResult, submittedResult, approvedResult, rejectedResult] = await Promise.all([
        articleService.getMyAll(),
        articleService.getMyDrafts(),
        articleService.getMySubmitted(),
        articleService.getMyApproved(),
        articleService.getMyRejected()
      ]);

      setStats({
        all: allResult.success ? (Array.isArray(allResult.data) ? allResult.data.length : allResult.data?.items?.length || 0) : 0,
        drafts: draftsResult.success ? (Array.isArray(draftsResult.data) ? draftsResult.data.length : draftsResult.data?.items?.length || 0) : 0,
        submitted: submittedResult.success ? (Array.isArray(submittedResult.data) ? submittedResult.data.length : submittedResult.data?.items?.length || 0) : 0,
        approved: approvedResult.success ? (Array.isArray(approvedResult.data) ? approvedResult.data.length : approvedResult.data?.items?.length || 0) : 0,
        rejected: rejectedResult.success ? (Array.isArray(rejectedResult.data) ? rejectedResult.data.length : rejectedResult.data?.items?.length || 0) : 0
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

