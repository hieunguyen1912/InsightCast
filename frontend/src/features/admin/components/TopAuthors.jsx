/**
 * Top Authors Component
 * Displays top authors by article count
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Award, FileText } from 'lucide-react';
import adminService from '../api';

function TopAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadAuthors();
  }, [limit]);

  const loadAuthors = async () => {
    setLoading(true);
    setError(null);
    const result = await adminService.getTopAuthors({ limit });
    
    if (result.success && result.data) {
      setAuthors(result.data.authors || []);
    } else {
      setError(result.error || 'Failed to load top authors');
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
          onClick={loadAuthors}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = authors.map(author => ({
    name: author.name || author.email || 'Unknown',
    total: author.totalArticles || 0,
    approved: author.approvedArticles || 0,
    pending: author.pendingArticles || 0,
    rejected: author.rejectedArticles || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-6 w-6" />
          Top Authors
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
          <button
            onClick={loadAuthors}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Author Performance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
              <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Authors Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Author Details</h3>
        {authors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Author</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Approved</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Pending</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Rejected</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Approval Rate</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author, index) => {
                  const approvalRate = author.totalArticles > 0
                    ? ((author.approvedArticles || 0) / author.totalArticles * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <tr key={author.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{author.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{author.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 font-medium">
                        {author.totalArticles || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-green-600 font-medium">
                        {author.approvedArticles || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-yellow-600 font-medium">
                        {author.pendingArticles || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-red-600 font-medium">
                        {author.rejectedArticles || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-blue-600 font-medium">
                        {approvalRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No authors found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopAuthors;

