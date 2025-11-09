/**
 * Admin Overview Component
 * Dashboard overview for ADMIN role
 */

import React from 'react';
import { 
  FileText, 
  Users, 
  Shield, 
  FolderTree,
  AlertCircle
} from 'lucide-react';

/**
 * AdminOverview component
 * @param {Object} props
 * @param {Object} props.stats - Statistics for admin dashboard
 * @param {Function} props.onNavigate - Callback to navigate to different modules
 */
function AdminOverview({ stats = {}, onNavigate }) {
  const statCards = [
    {
      id: 'articles',
      title: 'Pending Articles',
      value: stats.pendingArticles || 0,
      icon: FileText,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      description: 'Articles waiting for approval'
    },
    {
      id: 'users',
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      description: 'Registered users in system'
    },
    {
      id: 'roles',
      title: 'Roles',
      value: stats.totalRoles || 0,
      icon: Shield,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      description: 'System roles defined'
    },
    {
      id: 'categories',
      title: 'Categories',
      value: stats.totalCategories || 0,
      icon: FolderTree,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      description: 'Article categories'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-red-100">
          Manage users, roles, permissions, categories, and approve articles from moderators.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-6 cursor-pointer hover:shadow-md transition-all`}
              onClick={() => onNavigate && onNavigate(stat.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-white">
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate && onNavigate('articles')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">Review Articles</span>
          </button>
          
          <button
            onClick={() => onNavigate && onNavigate('users')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span className="font-medium">Manage Users</span>
          </button>
          
          <button
            onClick={() => onNavigate && onNavigate('roles')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Shield className="h-5 w-5" />
            <span className="font-medium">Roles & Permissions</span>
          </button>
          
          <button
            onClick={() => onNavigate && onNavigate('categories')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FolderTree className="h-5 w-5" />
            <span className="font-medium">Manage Categories</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">System Status</h2>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">All Systems Operational</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Pending Approvals</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingArticles || 0}</p>
            {stats.pendingArticles > 0 && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Action required
              </p>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">System Roles</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRoles || 0}</p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Admin Best Practices</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Regularly review and approve pending articles from moderators</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Monitor user activity and manage roles appropriately</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Keep category structure organized and up-to-date</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Review and update permissions based on organizational needs</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdminOverview;

