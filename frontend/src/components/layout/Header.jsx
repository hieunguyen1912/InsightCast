/**
 * Header component - Sports News Website Design
 * Black header with navigation and subscribe button
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PermissionGuard } from '../common';
import { Search, Menu, ChevronDown, User, LogOut, FileText, Shield, ChevronRight } from 'lucide-react';
import categoryService from '../../features/category/api';
import NotificationBell from '../../features/notification/components/NotificationBell';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTree, setCategoryTree] = useState([]);
  const [expandedCategoriesArray, setExpandedCategoriesArray] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const userMenuRef = useRef(null);
  const categoriesMenuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Fetch category tree on mount
  useEffect(() => {
    const fetchCategoryTree = async () => {
      setLoadingCategories(true);
      try {
        const result = await categoryService.getCategoryTree();
        if (result.success) {
          const categoryData = result.data?.data || result.data || [];
          setCategoryTree(Array.isArray(categoryData) ? categoryData : []);
        }
      } catch (error) {
        console.error('Error fetching category tree:', error);
        setCategoryTree([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoryTree();
  }, []);

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategoriesArray(prev => {
      const newArray = [...prev];
      const index = newArray.indexOf(categoryId);
      if (index > -1) {
        newArray.splice(index, 1);
      } else {
        newArray.push(categoryId);
      }
      return newArray;
    });
  };

  // Close user menu and categories menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) {
        setIsCategoriesMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isCategoriesMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isCategoriesMenuOpen]);

  const handleCategoryClick = (categoryId, e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsCategoriesMenuOpen(false);
    navigate(`/category/${categoryId}`);
  };

  // Render category tree recursively
  const renderCategoryTree = (categories, level = 0) => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return null;
    }

    return categories
      .filter(cat => cat && cat.id && cat.isActive !== false)
      .map((category) => {
        const hasChildren = Array.isArray(category.children) && category.children.length > 0;
        const isExpanded = expandedCategoriesArray.includes(category.id);

        return (
          <div key={category.id}>
            <div
              className="flex items-center justify-between group"
              style={{ paddingLeft: `${8 + level * 16}px` }}
            >
              <div className="flex items-center flex-1 min-w-0">
                {/* Expand/Collapse Icon */}
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategoryExpand(category.id);
                    }}
                    className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
                    type="button"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-600" />
                    )}
                  </button>
                ) : (
                  <div className="w-5 mr-2" /> // Spacer for alignment
                )}

                {/* Category Name */}
                <button
                  onClick={(e) => handleCategoryClick(category.id, e)}
                  className="flex-1 text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded"
                  type="button"
                >
                  {category.name || 'Unnamed Category'}
                </button>
              </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
              <div className="ml-2">
                {renderCategoryTree(category.children, level + 1)}
              </div>
            )}
          </div>
        );
      });
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
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
              
              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesMenuRef}>
                <button
                  onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
                  className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors"
                  type="button"
                >
                  <span>Categories</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Categories Dropdown Menu */}
                {isCategoriesMenuOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {loadingCategories ? (
                      <div className="px-4 py-3 text-sm text-gray-600">Loading categories...</div>
                    ) : categoryTree.length > 0 ? (
                      <div className="py-2">
                        {(() => {
                          try {
                            return renderCategoryTree(categoryTree);
                          } catch (error) {
                            console.error('Error rendering category tree:', error);
                            return (
                              <div className="px-4 py-3 text-sm text-red-600">
                                Error loading categories. Please try again.
                              </div>
                            );
                          }
                        })()}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-600">No categories available</div>
                    )}
                  </div>
                )}
              </div>
            </nav>
            
            {/* User Menu / Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <NotificationBell />
              )}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  {/* User Menu Button */}
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="text-white text-sm hidden sm:inline">
                        {user?.firstName || user?.username || 'User'}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.firstName || user?.username || 'User'}
                        </p>
                        {user?.email && (
                          <p className="text-xs text-gray-500 mt-1 break-words">
                            {user.email}
                          </p>
                        )}
                      </div>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                      
                      <PermissionGuard requiredRoles={['MODERATOR', 'ADMIN']}>
                        <Link
                          to="/moderator"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-3" />
                          Moderator Panel
                        </Link>
                      </PermissionGuard>
                      
                      <PermissionGuard requiredRoles={['ADMIN']}>
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Shield className="h-4 w-4 mr-3" />
                          Admin Panel
                        </Link>
                      </PermissionGuard>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
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
    </>
  );
}

export default Header;
