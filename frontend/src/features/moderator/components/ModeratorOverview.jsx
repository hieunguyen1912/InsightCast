/**
 * Moderator Overview Component
 * Dashboard overview for MODERATOR role
 */

import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Eye
} from 'lucide-react';

/**
 * ModeratorOverview component
 * @param {Object} props
 * @param {Object} props.stats - Statistics for articles
 * @param {Function} props.onNavigate - Callback to navigate to different modules
 */
function ModeratorOverview({ stats = {}, onNavigate }) {
  const statCards = [
    {
      id: 'drafts',
      title: 'Drafts',
      value: stats.drafts || 0,
      icon: FileText,
      color: 'gray',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    },
    {
      id: 'submitted',
      title: 'Pending Review',
      value: stats.submitted || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'approved',
      title: 'Approved',
      value: stats.approved || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      id: 'rejected',
      title: 'Rejected',
      value: stats.rejected || 0,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Moderator Dashboard</h1>
        <p className="text-orange-100">
          Manage your articles, track submissions, and monitor performance.
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
                <div className={`p-3 rounded-lg bg-white`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate && onNavigate('create')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">Create New Article</span>
          </button>
          
          <button
            onClick={() => onNavigate && onNavigate('all')}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="h-5 w-5" />
            <span className="font-medium">View All Articles</span>
          </button>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Performance Insights</h2>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.all || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.all > 0 
                  ? Math.round((stats.approved / stats.all) * 100) 
                  : 0}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Article Status Distribution</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
              {stats.all > 0 && (
                <>
                  {stats.approved > 0 && (
                    <div 
                      className="bg-green-500 h-full"
                      style={{ width: `${(stats.approved / stats.all) * 100}%` }}
                      title={`Approved: ${stats.approved}`}
                    />
                  )}
                  {stats.submitted > 0 && (
                    <div 
                      className="bg-yellow-500 h-full"
                      style={{ width: `${(stats.submitted / stats.all) * 100}%` }}
                      title={`Pending: ${stats.submitted}`}
                    />
                  )}
                  {stats.drafts > 0 && (
                    <div 
                      className="bg-gray-400 h-full"
                      style={{ width: `${(stats.drafts / stats.all) * 100}%` }}
                      title={`Drafts: ${stats.drafts}`}
                    />
                  )}
                  {stats.rejected > 0 && (
                    <div 
                      className="bg-red-500 h-full"
                      style={{ width: `${(stats.rejected / stats.all) * 100}%` }}
                      title={`Rejected: ${stats.rejected}`}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-600">✓ Approved</span>
              <span className="text-yellow-600">⏳ Pending</span>
              <span className="text-gray-600">📝 Drafts</span>
              <span className="text-red-600">✗ Rejected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModeratorOverview;

