/**
 * Header component - Sports News Website Design
 * Black header with navigation and subscribe button
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Menu } from 'lucide-react';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <header className="bg-black text-white" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" aria-label="W LET'SREAD Home" className="text-2xl font-bold">
                W LET'SREAD
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
              <Link to="/join" className="text-white hover:text-gray-300 transition-colors">Join Us</Link>
              <Link to="/care" className="text-white hover:text-gray-300 transition-colors">Customer Care</Link>
              <Link to="/contact" className="text-white hover:text-gray-300 transition-colors">Reach Out</Link>
              <Link to="/about" className="text-white hover:text-gray-300 transition-colors">About Us</Link>
            </nav>
            
            {/* Subscribe Button */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">Welcome, {user?.firstName || user?.username || 'User'}!</span>
                  <Link to="/dashboard" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-white hover:text-gray-300 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Subscribe
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Header */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <button className="p-2">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <p className="text-gray-800 font-medium">Sign Up for Our Paris Olympics Newsletter</p>
            <button className="p-2">
              <Search className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
