/**
 * Dashboard page component
 * Main dashboard with sidebar navigation and module content
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import ProfileModule from '../components/ProfileModule';
import PodcastManagement from '../components/PodcastManagement';
import FavoritesModule from '../components/FavoritesModule';
import TtsConfigManagement from '../components/TtsConfigManagement';
import NotificationModule from '../../notification/components/NotificationModule';

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Dashboard modules configuration
  const modules = {
    profile: ProfileModule,
    podcasts: PodcastManagement,
    favorites: FavoritesModule,
    notifications: NotificationModule,
    'tts-configs': TtsConfigManagement
  };

  const [activeModule, setActiveModule] = useState('podcasts');

  // Set active module based on URL path or search params
  useEffect(() => {
    if (location.pathname === '/me') {
      setActiveModule('profile');
    } else {
      const params = new URLSearchParams(location.search);
      const module = params.get('module');
      // Redirect settings to podcasts if settings module is removed
      if (module === 'settings') {
        setActiveModule('podcasts');
      } else if (module && modules[module]) {
        setActiveModule(module);
      } else {
        setActiveModule('podcasts');
      }
    }
  }, [location.pathname, location.search]);

  // Redirect if activeModule is settings (fallback)
  useEffect(() => {
    if (activeModule === 'settings') {
      setActiveModule('podcasts');
    }
  }, [activeModule]);

  const ActiveComponent = modules[activeModule];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center px-4 py-16">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">Please login to access your dashboard.</p>
            <a 
              href="/login" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex min-h-[calc(100vh-5rem)] max-md:flex-col">
        {/* Sidebar Navigation */}
        <DashboardSidebar 
          activeModule={activeModule}
          onModuleChange={setActiveModule}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto" role="main">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 border-b border-gray-200 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">
              {activeModule === 'profile' && 'Profile'}
              {activeModule === 'podcasts' && 'My Podcasts'}
              {activeModule === 'favorites' && 'My Favorites'}
              {activeModule === 'notifications' && 'Notifications'}
              {activeModule === 'tts-configs' && 'TTS Configurations'}
            </h1>
            <div className="flex gap-4">
              {/* Quick actions can be added here */}
            </div>
          </div>
          
          <div className="max-w-7xl">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
