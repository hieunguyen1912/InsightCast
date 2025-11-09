/**
 * Category Picker Modal Component
 * Displays category tree in a modal for easy selection
 */

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { Input, Button } from '../../../components/common';
import categoryService from '../../category/api';

function CategoryPickerModal({ isOpen, onClose, selectedCategoryId, onSelect }) {
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Load category tree when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategoryTree();
      // Expand categories that contain the selected category
      if (selectedCategoryId) {
        expandToSelectedCategory(selectedCategoryId);
      }
    } else {
      // Reset when modal closes
      setSearchQuery('');
      setExpandedCategories(new Set());
    }
  }, [isOpen, selectedCategoryId]);

  const loadCategoryTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await categoryService.getCategoryTree();
      
      if (result.success && result.data) {
        const categoriesList = Array.isArray(result.data) 
          ? result.data 
          : (result.data.content || []);
        setCategoryTree(categoriesList);
      } else {
        setError(result.error || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading category tree:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Expand tree to show selected category
  const expandToSelectedCategory = (categoryId) => {
    const findAndExpand = (categories, parentIds = []) => {
      for (const category of categories) {
        if (category.id === categoryId) {
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
    
    findAndExpand(categoryTree);
  };

  // Toggle category expansion
  const toggleExpand = (categoryId) => {
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
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase().trim();
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

  // Render category tree recursively
  const renderCategoryTree = (categories, level = 0) => {
    const filteredCategories = filterCategories(categories);

    if (filteredCategories.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          No categories found
        </div>
      );
    }

    return filteredCategories.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = selectedCategoryId === category.id;

      return (
        <div key={category.id}>
          {/* Category Item */}
          <div
            className={`
              flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
              ${isSelected 
                ? 'bg-orange-500 text-white' 
                : 'hover:bg-gray-100 text-gray-700'
              }
            `}
            style={{ paddingLeft: `${12 + level * 24}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleExpand(category.id);
              }
            }}
          >
            <div className="flex items-center flex-1 min-w-0">
              {/* Expand/Collapse Icon */}
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(category.id);
                  }}
                  className="mr-2 p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="w-6 mr-2" /> // Spacer for alignment
              )}

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{category.name}</div>
                {category.description && (
                  <div className={`text-xs truncate ${isSelected ? 'text-orange-50' : 'text-gray-500'}`}>
                    {category.description}
                  </div>
                )}
              </div>

              {/* Select Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(category);
                  onClose();
                }}
                className={`
                  ml-3 px-3 py-1 rounded text-sm font-medium transition-colors
                  ${isSelected
                    ? 'bg-white text-orange-500 hover:bg-orange-50'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                  }
                `}
              >
                {isSelected ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Selected
                  </span>
                ) : (
                  'Select'
                )}
              </button>
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm ${
        isOpen ? '' : 'hidden'
      }`}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Select Category</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadCategoryTree} variant="secondary">
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {renderCategoryTree(categoryTree)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CategoryPickerModal;

