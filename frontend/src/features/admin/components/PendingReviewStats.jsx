/**
 * Pending Review Statistics Component
 * Displays statistics about pending article reviews
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import adminService from '../api';

function PendingReviewStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    const result = await adminService.getPendingReviewStats();
    
    if (result.success) {
      setStats(result.data);
    } else {
      setError(result.error || 'Failed to load pending review stats');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">{error}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      id: 'total',
      title: 'Total Pending',
      value: stats.totalPending || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      description: 'Articles waiting for review'
    },
    {
      id: '24h',
      title: 'Older than 24h',
      value: stats.pendingOlderThan24Hours || 0,
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      description: 'Requires attention'
    },
    {
      id: '48h',
      title: 'Older than 48h',
      value: stats.pendingOlderThan48Hours || 0,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      description: 'Urgent review needed'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Pending Review Statistics
        </h2>
        <button
          onClick={loadStats}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-6 hover:shadow-md transition-all`}
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

      {/* Alert Section */}
      {(stats.pendingOlderThan24Hours > 0 || stats.pendingOlderThan48Hours > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Action Required</h3>
              <p className="text-sm text-red-800 mb-3">
                There are articles waiting for review that require immediate attention.
              </p>
              <ul className="space-y-1 text-sm text-red-700">
                {stats.pendingOlderThan24Hours > 0 && (
                  <li>• {stats.pendingOlderThan24Hours} article(s) pending for more than 24 hours</li>
                )}
                {stats.pendingOlderThan48Hours > 0 && (
                  <li>• {stats.pendingOlderThan48Hours} article(s) pending for more than 48 hours</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingReviewStats;

