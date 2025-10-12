/**
 * Header component
 * Main navigation header with logo, search, and user menu
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging
  console.log('Header - isAuthenticated:', isAuthenticated);
  console.log('Header - user:', user);

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
    <header className="header" role="banner">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <Link to="/" aria-label="PodcastAI Home">
            <h1>PodcastAI</h1>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <form onSubmit={handleSearch} role="search">
            <div className="search-input-group">
              <input
                type="search"
                placeholder="Search podcasts, episodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search podcasts and episodes"
                className="search-input"
              />
              <button
                type="submit"
                aria-label="Search"
                className="search-button"
              >
                🔍
              </button>
            </div>
          </form>
        </div>

        {/* User Menu */}
        <div className="header-user">
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="user-menu-trigger"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <span className="user-avatar">
                  {user?.firstName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="user-name">
                  {user?.firstName || user?.username || 'User'}
                </span>
                <span className="menu-arrow">▼</span>
              </button>

              {isMenuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <Link to="/me" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/favorites" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                    Favorites
                  </Link>
                  <Link to="/settings" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                    Settings
                  </Link>
                  <hr />
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="logout-button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
