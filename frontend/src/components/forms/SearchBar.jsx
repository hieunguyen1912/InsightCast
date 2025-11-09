/**
 * SearchBar component - Search and filter news articles
 * Supports keyword search, category filter, and date range
 */

import React, { useState } from 'react';
import { Search, Filter, X, Calendar, Tag } from 'lucide-react';

/**
 * SearchBar component
 * @param {Object} props
 * @param {Function} props.onSearch - Callback function when search is triggered
 * @param {Array} props.categories - Array of category objects with {id, name}
 * @param {Object} props.initialFilters - Initial filter values
 */
function SearchBar({ onSearch, categories = [], initialFilters = {} }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    keyword: initialFilters.keyword || '',
    categoryId: initialFilters.categoryId || '',
    fromDate: initialFilters.fromDate || '',
    toDate: initialFilters.toDate || ''
  });

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
      fromDate: '',
      toDate: ''
    });
    onSearch({
      keyword: '',
      categoryId: '',
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
              {categories.find(c => c.id == filters.categoryId)?.name || 'Category'}
              <button
                onClick={() => setFilters({ ...filters, categoryId: '' })}
                className="ml-1 hover:opacity-70"
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
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-0 transition-colors bg-white text-gray-900 font-medium cursor-pointer hover:border-gray-300"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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

