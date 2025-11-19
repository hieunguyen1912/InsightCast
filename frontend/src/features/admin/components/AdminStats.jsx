/**
 * Admin Stats Component
 * Comprehensive statistics dashboard with tabs for different stat categories
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  TrendingUp, 
  Award, 
  Heart,
  Clock
} from 'lucide-react';
import DashboardStats from './DashboardStats';
import ArticleStats from './ArticleStats';
import UserStats from './UserStats';
import ArticleTrends from './ArticleTrends';
import TopAuthors from './TopAuthors';
import EngagementStats from './EngagementStats';
import PendingReviewStats from './PendingReviewStats';

function AdminStats() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      component: DashboardStats
    },
    {
      id: 'articles',
      name: 'Articles',
      icon: FileText,
      component: ArticleStats
    },
    {
      id: 'users',
      name: 'Users',
      icon: Users,
      component: UserStats
    },
    {
      id: 'pending',
      name: 'Pending Review',
      icon: Clock,
      component: PendingReviewStats
    },
    {
      id: 'trends',
      name: 'Trends',
      icon: TrendingUp,
      component: ArticleTrends
    },
    {
      id: 'authors',
      name: 'Top Authors',
      icon: Award,
      component: TopAuthors
    },
    {
      id: 'engagement',
      name: 'Engagement',
      icon: Heart,
      component: EngagementStats
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DashboardStats;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="animate-fade-in">
        <ActiveComponent />
      </div>
    </div>
  );
}

export default AdminStats;

