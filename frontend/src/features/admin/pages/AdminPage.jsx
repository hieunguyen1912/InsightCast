/**
 * Admin Page
 * Main page for ADMIN role to manage:
 * - Categories
 * - Role Permissions
 * - Users
 * - Article Approval (moderator articles)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminOverview from '../components/AdminOverview';
import CategoryManagement from '../components/CategoryManagement';
import UserManagement from '../components/UserManagement';
import RolePermissionManagement from '../components/RolePermissionManagement';
import ArticleApprovalManagement from '../components/ArticleApprovalManagement';
import adminService from '../api';

function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeModule, setActiveModule] = useState('overview');
  const [stats, setStats] = useState({
    pendingArticles: 0,
    totalUsers: 0,
    totalRoles: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);

  // Check if user has ADMIN role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // TODO: Add proper role check when user object includes roles
    // For now, we assume authenticated users can access admin page
    // In production, you should check: user.roles?.includes('ADMIN')
    
    loadStats();
  }, [isAuthenticated, navigate]);

  // Load statistics
  const loadStats = async () => {
    setLoading(true);
    
    try {
      // Load admin statistics
      const statsResult = await adminService.getStats();
      
      if (statsResult.success) {
        setStats({
          pendingArticles: statsResult.data.pendingArticles || 0,
          totalUsers: statsResult.data.totalUsers || 0,
          totalRoles: statsResult.data.totalRoles || 0,
          totalCategories: statsResult.data.totalCategories || 0
        });
      } else {
        // Fallback: try to load individual stats
        const [pendingResult, usersResult] = await Promise.all([
          adminService.getPendingArticles({ page: 0, size: 1 }),
          adminService.getUsers({ page: 0, size: 1 })
        ]);

        setStats({
          pendingArticles: pendingResult.success ? (pendingResult.data?.totalElements || 0) : 0,
          totalUsers: usersResult.success ? (usersResult.data?.totalElements || 0) : 0,
          totalRoles: 0,
          totalCategories: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = (module) => {
    setActiveModule(module);
  };

  // Render active module content
  const renderContent = () => {
    switch (activeModule) {
      case 'overview':
        return (
          <AdminOverview 
            stats={stats}
            onNavigate={handleModuleChange}
          />
        );
      
      case 'categories':
        return (
          <CategoryManagement 
            onStatsChange={loadStats}
          />
        );
      
      case 'users':
        return (
          <UserManagement 
            onStatsChange={loadStats}
          />
        );
      
      case 'roles':
        return (
          <RolePermissionManagement 
            onStatsChange={loadStats}
          />
        );
      
      case 'articles':
        return (
          <ArticleApprovalManagement 
            onStatsChange={loadStats}
          />
        );
      
      default:
        return (
          <AdminOverview 
            stats={stats}
            onNavigate={handleModuleChange}
          />
        );
    }
  };

  const getPageTitle = () => {
    const titles = {
      overview: 'Admin Dashboard',
      categories: 'Category Management',
      users: 'User Management',
      roles: 'Role & Permission Management',
      articles: 'Article Approval'
    };
    
    return titles[activeModule] || 'Admin Dashboard';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">Please login to access the admin dashboard.</p>
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
        <AdminSidebar 
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

export default AdminPage;

