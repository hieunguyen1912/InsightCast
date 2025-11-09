/**
 * Moderator Sidebar Component
 * Sidebar navigation for MODERATOR dashboard
 */

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FolderOpen,
  ChevronRight
} from 'lucide-react';

/**
 * ModeratorSidebar component
 * @param {Object} props
 * @param {string} props.activeModule - Currently active module
 * @param {Function} props.onModuleChange - Callback when module changes
 * @param {Object} props.stats - Statistics for articles
 */
function ModeratorSidebar({ activeModule, onModuleChange, stats = {} }) {
  const { user } = useAuth();

  // Sidebar modules configuration
  const modules = [
    {
      id: 'overview',
      name: 'Overview',
      icon: LayoutDashboard,
      count: null
    },
    {
      id: 'create',
      name: 'Create Article',
      icon: FilePlus,
      count: null
    },
    {
      id: 'all',
      name: 'All Articles',
      icon: FolderOpen,
      count: stats.all || 0
    },
    {
      id: 'drafts',
      name: 'Drafts',
      icon: FileText,
      count: stats.drafts || 0
    },
    {
      id: 'submitted',
      name: 'Submitted',
      icon: Clock,
      count: stats.submitted || 0
    },
    {
      id: 'approved',
      name: 'Approved',
      icon: CheckCircle,
      count: stats.approved || 0
    },
    {
      id: 'rejected',
      name: 'Rejected',
      icon: XCircle,
      count: stats.rejected || 0
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Moderator Panel</h2>
        <p className="text-sm text-gray-600 mt-1">
          Welcome, <span className="font-semibold text-gray-900">{user?.firstName || user?.username || 'Moderator'}</span>!
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
            MODERATOR
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
                      ? 'bg-orange-500 text-white'
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
                        ? 'bg-orange-600 text-white' 
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

      {/* Quick Stats */}
      <div className="px-6 py-4 border-t border-gray-200 mt-auto">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <p className="text-xs text-orange-800 font-medium mb-3">Total Articles</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-orange-900">
              {stats.all || 0}
            </span>
            <div className="text-right">
              <p className="text-xs text-orange-700">
                <span className="font-semibold">{stats.approved || 0}</span> Published
              </p>
              <p className="text-xs text-orange-700">
                <span className="font-semibold">{stats.drafts || 0}</span> Drafts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-xs text-blue-700 mb-3">
            Check out our article writing guidelines and best practices.
          </p>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            View Guidelines →
          </button>
        </div>
      </div>
    </aside>
  );
}

export default ModeratorSidebar;

