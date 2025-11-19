/**
 * Admin Page
 * Main page for ADMIN role to manage:
 * - Categories
 * - Role Permissions
 * - Users
 * - Articles (all articles with tabs: All, Approved, Rejected, Drafts, Pending Review)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../../../hooks/useRole';
import AdminSidebar from '../components/AdminSidebar';
import AdminStats from '../components/AdminStats';
import CategoryManagement from '../components/CategoryManagement';
import UserManagement from '../components/UserManagement';
import RolePermissionManagement from '../components/RolePermissionManagement';
import AdminArticlesManagement from '../components/AdminArticlesManagement';
import adminService from '../api';

function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useRole();
  
  const [activeModule, setActiveModule] = useState('stats');
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

    // Kiểm tra quyền ADMIN - nếu không có quyền sẽ bị RoleProtectedRoute redirect
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    loadStats();
  }, [isAuthenticated, isAdmin, navigate]);

  // Handle query params to set active module
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const module = params.get('module');
    if (module && ['stats', 'categories', 'users', 'roles', 'all-articles'].includes(module)) {
      setActiveModule(module);
    }
  }, [location.search]);

  // Load statistics
  const loadStats = async () => {
    setLoading(true);
    
    try {
      // Load dashboard stats
      const dashboardResult = await adminService.getDashboardStats();
      
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
      case 'stats':
        return <AdminStats />;
      
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
      
      case 'all-articles':
        return (
          <AdminArticlesManagement 
            onStatsChange={loadStats}
          />
        );
      
      default:
        return <AdminStats />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      stats: 'Statistics',
      categories: 'Category Management',
      users: 'User Management',
      roles: 'Role & Permission Management',
      'all-articles': 'Articles Management'
    };
    
    return titles[activeModule] || 'Statistics';
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
            {loading && activeModule === 'stats' ? (
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

