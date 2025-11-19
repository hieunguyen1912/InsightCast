/**
 * Engagement Statistics Component
 * Displays engagement metrics and popular articles
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import adminService from '../api';

function EngagementStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    const result = await adminService.getEngagementStats();
    
    if (result.success) {
      setStats(result.data);
    } else {
      setError(result.error || 'Failed to load engagement stats');
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

  // Prepare chart data for popular articles
  const chartData = stats.popularArticles
    ? stats.popularArticles.slice(0, 10).map(article => ({
        name: article.title.length > 30 
          ? article.title.substring(0, 30) + '...' 
          : article.title,
        views: article.views || 0,
        likes: article.likes || 0
      }))
    : [];

  const engagementCards = [
    {
      id: 'views',
      title: 'Total Views',
      value: stats.totalViews?.toLocaleString() || 0,
      icon: Eye,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      id: 'likes',
      title: 'Total Likes',
      value: stats.totalLikes?.toLocaleString() || 0,
      icon: Heart,
      color: 'pink',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      borderColor: 'border-pink-200'
    },
    {
      id: 'comments',
      title: 'Total Comments',
      value: stats.totalComments?.toLocaleString() || 0,
      icon: MessageCircle,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Engagement Statistics
        </h2>
        <button
          onClick={loadStats}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engagementCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`${card.bgColor} border ${card.borderColor} rounded-lg p-6 hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-white">
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Popular Articles Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Popular Articles</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={120}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#3b82f6" name="Views" />
              <Bar dataKey="likes" fill="#ec4899" name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Popular Articles Table */}
      {stats.popularArticles && stats.popularArticles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Articles</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Likes</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Engagement</th>
                </tr>
              </thead>
              <tbody>
                {stats.popularArticles.map((article, index) => {
                  const totalEngagement = (article.views || 0) + (article.likes || 0);
                  return (
                    <tr key={article.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900 max-w-md truncate">
                          {article.title}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-blue-600 font-medium">
                        {(article.views || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-pink-600 font-medium">
                        {(article.likes || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 font-bold">
                        {totalEngagement.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default EngagementStats;

