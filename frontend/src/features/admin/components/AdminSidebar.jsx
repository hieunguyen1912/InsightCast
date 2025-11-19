/**
 * Admin Sidebar Component
 * Sidebar navigation for ADMIN dashboard
 */

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  FolderTree,
  Users,
  Shield,
  FileText,
  ChevronRight,
  BarChart3
} from 'lucide-react';

/**
 * AdminSidebar component
 * @param {Object} props
 * @param {string} props.activeModule - Currently active module
 * @param {Function} props.onModuleChange - Callback when module changes
 * @param {Object} props.stats - Statistics for admin dashboard
 */
function AdminSidebar({ activeModule, onModuleChange, stats = {} }) {
  const { user } = useAuth();

  // Sidebar modules configuration
  const modules = [
    {
      id: 'stats',
      name: 'Statistics',
      icon: BarChart3,
      count: null
    },
    {
      id: 'all-articles',
      name: 'Articles',
      icon: FileText,
      count: stats.pendingArticles || 0
    },
    {
      id: 'categories',
      name: 'Categories',
      icon: FolderTree,
      count: stats.totalCategories || 0
    },
    {
      id: 'users',
      name: 'Users',
      icon: Users,
      count: stats.totalUsers || 0
    },
    {
      id: 'roles',
      name: 'Roles & Permissions',
      icon: Shield,
      count: stats.totalRoles || 0
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600 mt-1">
          Welcome, <span className="font-semibold text-gray-900">{user?.firstName || user?.username || 'Admin'}</span>!
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
            ADMIN
          </span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="px-3 py-4" role="navigation">
        <ul className="space-y-1">
          {modules.map(module => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            
            return (
              <li key={module.id}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-red-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => onModuleChange(module.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium flex-1 text-left">{module.name}</span>
                  
                  {module.count !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {module.count}
                    </span>
                  )}
                  
                  {isActive && (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;

