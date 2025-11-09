/**
 * Dashboard overview module component
 * Shows analytics, statistics, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { podcastService } from '../../podcast/api';

function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPodcasts: 0,
    totalEpisodes: 0,
    totalListenTime: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load user statistics
        const statsResult = await podcastService.getUserStats();
        if (statsResult.success) {
          setStats(statsResult.data);
        }

        // Load recent activity
        const activityResult = await podcastService.getRecentActivity();
        if (activityResult.success) {
          setStats(prev => ({
            ...prev,
            recentActivity: activityResult.data
          }));
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-overview">
        <div className="module-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-overview">
        <div className="module-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>Welcome back, {user?.firstName || user?.username || 'User'}!</h2>
        <p>Here's what's happening with your podcasts</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎧</div>
          <div className="stat-content">
            <h3>{stats.totalPodcasts}</h3>
            <p>Total Podcasts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📻</div>
          <div className="stat-content">
            <h3>{stats.totalEpisodes}</h3>
            <p>Total Episodes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>{formatTime(stats.totalListenTime)}</h3>
            <p>Total Listen Time</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>0</h3>
            <p>This Week</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card">
            <div className="action-icon">➕</div>
            <div className="action-content">
              <h4>Create Podcast</h4>
              <p>Start a new podcast series</p>
            </div>
          </button>

          <button className="action-card">
            <div className="action-icon">🎙️</div>
            <div className="action-content">
              <h4>Record Episode</h4>
              <p>Add a new episode</p>
            </div>
          </button>

          <button className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h4>View Analytics</h4>
              <p>Check your performance</p>
            </div>
          </button>

          <button className="action-card">
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h4>Settings</h4>
              <p>Manage your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'episode' ? '🎙️' : '🎧'}
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.description}</p>
                  <span className="activity-time">{formatDate(activity.timestamp)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">
              <p>No recent activity</p>
              <p>Start creating content to see your activity here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
