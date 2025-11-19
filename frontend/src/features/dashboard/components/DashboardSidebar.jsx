/**
 * Dashboard sidebar component
 * Modern sidebar navigation with icons
 */

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  User, 
  Headphones, 
  ChevronRight,
  Volume2,
  Bookmark,
  Bell
} from 'lucide-react';

function DashboardSidebar({ activeModule, onModuleChange }) {
  const { user } = useAuth();

  // Dashboard modules configuration
  const modules = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User
    },
    {
      id: 'podcasts',
      name: 'My Podcasts',
      icon: Headphones
    },
    {
      id: 'favorites',
      name: 'Favorites',
      icon: Bookmark
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell
    },
    {
      id: 'tts-configs',
      name: 'TTS Configurations',
      icon: Volume2
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, <span className="font-semibold text-gray-900">{user?.firstName || user?.username || 'User'}</span>!
        </p>
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
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => onModuleChange(module.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium">{module.name}</span>
                  {isActive && (
                    <ChevronRight className="h-5 w-5 ml-auto" />
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

export default DashboardSidebar;
