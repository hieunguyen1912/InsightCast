/**
 * SearchBar component - Search and filter news articles
 * Supports keyword search, category filter, and date range
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Calendar, Tag, ChevronRight, ChevronDown, Check, Loader2 } from 'lucide-react';
import categoryService from '../../features/category/api';

/**
 * SearchBar component
 * @param {Object} props
 * @param {Function} props.onSearch - Callback function when search is triggered
 * @param {Object} props.initialFilters - Initial filter values
 */
function SearchBar({ onSearch, initialFilters = {} }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchCategoryQuery, setSearchCategoryQuery] = useState('');
  const categoryPopupRef = useRef(null);
  
  const [filters, setFilters] = useState({
    keyword: initialFilters.keyword || '',
    categoryId: initialFilters.categoryId || '',
    categoryName: initialFilters.categoryName || '',
    fromDate: initialFilters.fromDate || '',
    toDate: initialFilters.toDate || ''
  });

  // Load category tree when popup opens
  useEffect(() => {
    if (isCategoryPopupOpen && categoryTree.length === 0) {
      loadCategoryTree();
    }
  }, [isCategoryPopupOpen]);

  // Expand to show selected category when tree is loaded
  useEffect(() => {
    if (categoryTree.length > 0 && filters.categoryId) {
      expandToSelectedCategory(filters.categoryId, categoryTree);
    }
  }, [categoryTree, filters.categoryId]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryPopupRef.current && !categoryPopupRef.current.contains(event.target)) {
        setIsCategoryPopupOpen(false);
      }
    };

    if (isCategoryPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryPopupOpen]);

  // Load category tree
  const loadCategoryTree = async () => {
    try {
      setLoadingCategories(true);
      setCategoryError(null);
      const result = await categoryService.getCategoryTree();
      
      if (result.success && result.data) {
        const categoriesList = Array.isArray(result.data) 
          ? result.data 
          : (result.data.data || result.data.content || []);
        setCategoryTree(categoriesList);
      } else {
        setCategoryError(result.error || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading category tree:', err);
      setCategoryError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Expand tree to show selected category
  const expandToSelectedCategory = (categoryId, categories = categoryTree) => {
    const findAndExpand = (cats, parentIds = []) => {
      for (const category of cats) {
        if (category.id == categoryId) {
          // Expand all parent categories
          parentIds.forEach(id => {
            setExpandedCategories(prev => new Set(prev).add(id));
          });
          return true;
        }
        if (category.children && category.children.length > 0) {
          const found = findAndExpand(category.children, [...parentIds, category.id]);
          if (found) return true;
        }
      }
      return false;
    };
    
    findAndExpand(categories);
  };

  // Find category in tree by ID
  const findCategoryInTree = (categories, id) => {
    for (const category of categories) {
      if (category.id == id) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryInTree(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Toggle category expansion
  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Filter categories based on search query
  const filterCategories = (categories) => {
    if (!searchCategoryQuery.trim()) return categories;

    const query = searchCategoryQuery.toLowerCase().trim();
    const filtered = [];

    categories.forEach(category => {
      const matchesSearch = category.name.toLowerCase().includes(query) ||
                           (category.description && category.description.toLowerCase().includes(query));
      
      let filteredChildren = [];
      if (category.children && category.children.length > 0) {
        filteredChildren = filterCategories(category.children);
      }

      // Include if category matches or has matching children
      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...category,
          children: filteredChildren.length > 0 ? filteredChildren : category.children
        });
      }
    });

    return filtered;
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setFilters(prev => ({
      ...prev,
      categoryId: category.id,
      categoryName: category.name
    }));
    setIsCategoryPopupOpen(false);
    setSearchCategoryQuery('');
  };

  // Handle category clear
  const handleCategoryClear = () => {
    setFilters(prev => ({
      ...prev,
      categoryId: '',
      categoryName: ''
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      categoryId: '',
      categoryName: '',
      fromDate: '',
      toDate: ''
    });
    onSearch({
      keyword: '',
      categoryId: '',
      categoryName: '',
      fromDate: '',
      toDate: ''
    });
  };

  const hasActiveFilters = filters.categoryId || filters.fromDate || filters.toDate;
  const activeFiltersCount = [
    filters.categoryId,
    filters.fromDate,
    filters.toDate
  ].filter(Boolean).length;

  // Render category tree recursively
  const renderCategoryTree = (categories, level = 0) => {
    const filteredCategories = filterCategories(categories);

    if (filteredCategories.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4 text-sm">
          No categories found
        </div>
      );
    }

    return filteredCategories.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = filters.categoryId == category.id;

      return (
        <div key={category.id}>
          {/* Category Item */}
          <div
            role="option"
            aria-selected={isSelected}
            className={`
              flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150
              ${isSelected 
                ? 'bg-black text-white shadow-sm' 
                : 'hover:bg-gray-100 text-gray-700 active:bg-gray-200'
              }
            `}
            style={{ paddingLeft: `${12 + level * 20}px` }}
          >
            <div className="flex items-center flex-1 min-w-0">
              {/* Expand/Collapse Icon */}
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategoryExpand(category.id);
                  }}
                  className={`mr-2 p-1 rounded transition-all duration-150 flex-shrink-0 ${
                    isSelected 
                      ? 'hover:bg-white hover:bg-opacity-20 active:bg-opacity-30' 
                      : 'hover:bg-gray-200 active:bg-gray-300'
                  }`}
                  type="button"
                  aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="w-6 mr-2 flex-shrink-0" />
              )}

              {/* Category Info */}
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  handleCategorySelect(category);
                  setSearchCategoryQuery('');
                }}
              >
                <div className="font-medium truncate text-sm leading-tight">{category.name}</div>
                {category.description && (
                  <div className={`text-xs truncate mt-0.5 leading-tight ${
                    isSelected ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    {category.description}
                  </div>
                )}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <Check className="w-4 h-4 ml-2 flex-shrink-0" aria-hidden="true" />
              )}
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="mt-0.5 transition-all duration-150 ease-out">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-full mb-6">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="Search articles..."
            className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-0 transition-colors bg-white"
          />
        </div>

        {/* Filter Toggle & Search Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`relative flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${
              hasActiveFilters
                ? 'bg-black text-white border-black hover:bg-gray-800'
                : 'bg-white text-black border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline whitespace-nowrap">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={handleSearch}
            className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && !isFilterOpen && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.categoryId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-sm">
              <Tag className="h-3 w-3" />
              {filters.categoryName || 'Category'}
              <button
                onClick={handleCategoryClear}
                className="ml-1 hover:opacity-70"
                type="button"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.fromDate && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-sm">
              <Calendar className="h-3 w-3" />
              From: {new Date(filters.fromDate).toLocaleDateString()}
              <button
                onClick={() => setFilters({ ...filters, fromDate: '' })}
                className="ml-1 hover:opacity-70"
                type="button"
                aria-label="Remove from date filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.toDate && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-sm">
              <Calendar className="h-3 w-3" />
              To: {new Date(filters.toDate).toLocaleDateString()}
              <button
                onClick={() => setFilters({ ...filters, toDate: '' })}
                className="ml-1 hover:opacity-70"
                type="button"
                aria-label="Remove to date filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
              <p className="text-sm text-gray-500 mt-1">Refine your search</p>
            </div>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryPopupOpen(!isCategoryPopupOpen);
                    // Auto-focus search input when opening
                    if (!isCategoryPopupOpen) {
                      setTimeout(() => {
                        const searchInput = categoryPopupRef.current?.querySelector('input[type="text"]');
                        if (searchInput) {
                          searchInput.focus();
                        }
                      }, 100);
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 transition-all bg-white text-gray-900 font-medium cursor-pointer hover:border-gray-400 text-left flex items-center justify-between ${
                    filters.categoryId 
                      ? 'border-black shadow-sm' 
                      : 'border-gray-200'
                  } ${isCategoryPopupOpen ? 'border-black shadow-md' : ''}`}
                  aria-expanded={isCategoryPopupOpen}
                  aria-haspopup="listbox"
                  aria-label="Select category"
                >
                  <span className={`truncate ${filters.categoryId ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {filters.categoryName || 'All Categories'}
                  </span>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform duration-200 ${isCategoryPopupOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Category Dropdown Menu */}
                {isCategoryPopupOpen && (
                  <div
                    ref={categoryPopupRef}
                    className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col transition-all duration-200 ease-out opacity-100 transform translate-y-0"
                    role="listbox"
                    aria-label="Category options"
                  >
                    {/* Search Bar */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={searchCategoryQuery}
                          onChange={(e) => setSearchCategoryQuery(e.target.value)}
                          onKeyDown={(e) => {
                            // Close on Escape
                            if (e.key === 'Escape') {
                              setIsCategoryPopupOpen(false);
                              setSearchCategoryQuery('');
                            }
                          }}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 text-sm bg-white"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Category Tree */}
                    <div className="overflow-y-auto flex-1 px-2 py-2 max-h-64 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {loadingCategories ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
                        </div>
                      ) : categoryError ? (
                        <div className="text-center py-8 px-4">
                          <p className="text-red-500 text-sm mb-3">{categoryError}</p>
                          <button
                            onClick={loadCategoryTree}
                            className="text-sm px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            type="button"
                          >
                            Retry
                          </button>
                        </div>
                      ) : categoryTree.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm px-4">
                          No categories available
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          {/* All Categories Option */}
                          <div
                            role="option"
                            aria-selected={!filters.categoryId}
                            className={`
                              flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150
                              ${!filters.categoryId 
                                ? 'bg-black text-white shadow-sm' 
                                : 'hover:bg-gray-100 text-gray-700 active:bg-gray-200'
                              }
                            `}
                            onClick={() => {
                              handleCategoryClear();
                              setIsCategoryPopupOpen(false);
                              setSearchCategoryQuery('');
                            }}
                            onMouseEnter={(e) => {
                              if (filters.categoryId) {
                                e.currentTarget.classList.add('bg-gray-50');
                              }
                            }}
                          >
                            <span className="font-medium text-sm">All Categories</span>
                            {!filters.categoryId && (
                              <Check className="w-4 h-4 ml-2 flex-shrink-0" />
                            )}
                          </div>
                          
                          {/* Category Tree */}
                          {renderCategoryTree(categoryTree)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* From Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  max={filters.toDate || undefined}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-0 transition-colors bg-white text-gray-900 font-medium cursor-pointer hover:border-gray-300"
                />
              </div>
            </div>

            {/* To Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  min={filters.fromDate || undefined}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-0 transition-colors bg-white text-gray-900 font-medium cursor-pointer hover:border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSearch}
              className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium text-gray-700 flex items-center gap-2"
            >
              <X className="h-5 w-5" />
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;

