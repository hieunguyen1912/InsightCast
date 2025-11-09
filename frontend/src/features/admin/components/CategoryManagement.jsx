/**
 * Category Management Component
 * Admin component for managing article categories
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Search as SearchIcon,
  FolderTree,
  Save,
  X,
  Eye,
  ChevronRight,
  Home
} from 'lucide-react';
import { Button, Input, Spinner, Alert, ConfirmModal, Modal } from '../../../components/common';
import categoryService from '../../category/api';

/**
 * CategoryManagement component
 * @param {Object} props
 * @param {Function} props.onStatsChange - Callback when stats change
 */
function CategoryManagement({ onStatsChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, categoryId: null, categoryName: '' });
  const [viewMode, setViewMode] = useState('tree');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [children, setChildren] = useState([]);
  const [showBreadcrumb, setShowBreadcrumb] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: '',
    isActive: true,
    icon: '',
    color: '',
    parentId: null
  });

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (viewMode === 'root') {
        // Use getRootCategories for better performance
        result = await categoryService.getRootCategories();
        
        if (result.success) {
          const categoryData = result.data?.data || result.data || [];
          const categoriesList = Array.isArray(categoryData) ? categoryData : [];
          
          // Load children count for each root category
          const categoriesWithChildrenCount = await Promise.all(
            categoriesList.map(async (category) => {
              try {
                const childrenResult = await categoryService.getCategoryChildren(category.id);
                const childrenCount = childrenResult.success 
                  ? ((childrenResult.data?.data || childrenResult.data || [])).length 
                  : 0;
                return {
                  ...category,
                  childrenCount,
                  hasChildren: childrenCount > 0
                };
              } catch (err) {
                console.error(`Error loading children count for category ${category.id}:`, err);
                return {
                  ...category,
                  childrenCount: 0,
                  hasChildren: false
                };
              }
            })
          );
          
          setCategories(categoriesWithChildrenCount);
        } else {
          setError(result.error || 'Failed to load categories');
          setCategories([]);
        }
      } else {
        // Use getCategoryTree for full hierarchical view
        result = await categoryService.getCategoryTree();
        
        if (result.success) {
          const categoryData = result.data?.data || result.data || [];
          setCategories(Array.isArray(categoryData) ? categoryData : []);
        } else {
          setError(result.error || 'Failed to load categories');
          setCategories([]);
        }
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('An unexpected error occurred');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryBreadcrumb = async (categoryId) => {
    try {
      const result = await categoryService.getCategoryBreadcrumb(categoryId);
      if (result.success) {
        const breadcrumbData = result.data?.data || result.data || [];
        setBreadcrumb(Array.isArray(breadcrumbData) ? breadcrumbData : []);
        setShowBreadcrumb(true);
      } else {
        setError(result.error || 'Failed to load breadcrumb');
      }
    } catch (err) {
      console.error('Error loading breadcrumb:', err);
      setError('Failed to load breadcrumb');
    }
  };

  const loadCategoryChildren = async (categoryId) => {
    try {
      const result = await categoryService.getCategoryChildren(categoryId);
      if (result.success) {
        const childrenData = result.data?.data || result.data || [];
        setChildren(Array.isArray(childrenData) ? childrenData : []);
        setShowChildren(true);
      } else {
        setError(result.error || 'Failed to load children');
      }
    } catch (err) {
      console.error('Error loading children:', err);
      setError('Failed to load children');
    }
  };

  // Load categories when viewMode changes or on mount
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      displayOrder: '',
      isActive: true,
      icon: '',
      color: '',
      parentId: null
    });
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setIsCreating(false);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      displayOrder: category.displayOrder !== undefined ? category.displayOrder : '',
      isActive: category.isActive !== undefined ? category.isActive : true,
      icon: category.icon || '',
      color: category.color || '',
      parentId: category.parentId || category.parentCategoryId || null
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      displayOrder: '',
      isActive: true,
      icon: '',
      color: '',
      parentId: null
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      let result;
      
      const categoryPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parentId: formData.parentId || null
      };

      // Add optional fields
      if (formData.displayOrder !== '' && formData.displayOrder !== null) {
        categoryPayload.displayOrder = Number(formData.displayOrder);
      }

      if (formData.isActive !== undefined && formData.isActive !== null) {
        categoryPayload.isActive = Boolean(formData.isActive);
      }

      if (formData.icon !== undefined && formData.icon !== null && formData.icon.trim()) {
        categoryPayload.icon = formData.icon.trim();
      }

      if (formData.color !== undefined && formData.color !== null && formData.color.trim()) {
        categoryPayload.color = formData.color.trim();
      }

      if (editingCategory) {
        result = await categoryService.updateCategory(editingCategory.id, categoryPayload);
      } else {
        result = await categoryService.createCategory(categoryPayload);
      }

      if (result.success) {
        await loadCategories();
        handleCancel();
        if (onStatsChange) onStatsChange();
        setError(null);
      } else {
        setError(result.error || 'Failed to save category');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteClick = (categoryId, categoryName) => {
    setDeleteConfirmation({
      isOpen: true,
      categoryId,
      categoryName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.categoryId) return;
    
    try {
      const result = await categoryService.deleteCategory(deleteConfirmation.categoryId);
      
      if (result.success) {
        await loadCategories();
        setDeleteConfirmation({ isOpen: false, categoryId: null, categoryName: '' });
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, categoryId: null, categoryName: '' });
  };

  // Flatten categories for display
  const flattenCategories = (cats, level = 0, result = []) => {
    cats.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, level + 1, result);
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);
  
  const filteredCategories = flatCategories.filter(cat => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(searchLower) ||
      cat.description?.toLowerCase().includes(searchLower)
    );
  });

  const renderCategoryRow = (category) => {
    const indent = category.level * 20;
    const isEditing = editingCategory?.id === category.id;

    return (
      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div style={{ paddingLeft: `${indent}px` }} className="flex items-center gap-2">
            {category.level > 0 && <FolderTree className="h-4 w-4 text-gray-400" />}
            <span className="font-medium text-gray-900">{category.name}</span>
          </div>
        </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {category.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {category.displayOrder !== undefined && category.displayOrder !== null 
                          ? category.displayOrder 
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {viewMode === 'root' 
                          ? (category.childrenCount !== undefined ? category.childrenCount : (category.children?.length || 0))
                          : (category.children?.length || 0)
                        } subcategories
                      </span>
                    </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-2">
            {/* Only show children button in Root Only mode (Full Tree already shows children) */}
            {viewMode === 'root' && (category.hasChildren || category.childrenCount > 0 || (category.children && category.children.length > 0)) && (
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  loadCategoryChildren(category.id);
                }}
                className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                title="View children"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => {
                setSelectedCategory(category);
                loadCategoryBreadcrumb(category.id);
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              title="View breadcrumb"
            >
              <Home className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEditClick(category)}
              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit category"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteClick(category.id, category.name)}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Full Tree
            </button>
            <button
              onClick={() => setViewMode('root')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'root'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Root Only
            </button>
          </div>
          
          <button
            onClick={loadCategories}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          
          {!isCreating && !editingCategory && (
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Category
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={isCreating || !!editingCategory}
        onClose={handleCancel}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description (optional, max 2000 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order (Optional)
                </label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  placeholder="Display order"
                  className="w-full"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., fa-microchip (max 50 chars)"
                  className="w-full"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.icon.length}/50 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., #FF5733"
                    className="w-full"
                  />
                  {formData.color && (
                    <div
                      className="w-10 h-10 rounded border border-gray-300"
                      style={{ backgroundColor: formData.color }}
                      title={formData.color}
                    ></div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Hex color code (e.g., #FF5733)
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category (Optional)
              </label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">None (Root Category)</option>
                {flatCategories
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'  '.repeat(cat.level)}
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
      </Modal>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'No categories match your search criteria' 
              : 'Get started by creating your first category'
            }
          </p>
          {!searchTerm && !isCreating && (
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Category
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcategories
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map(category => renderCategoryRow(category))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {!error && filteredCategories.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredCategories.length} of {flatCategories.length} categor{flatCategories.length !== 1 ? 'ies' : 'y'}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={
          <div className="space-y-2">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>"{deleteConfirmation.categoryName}"</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone. All subcategories will also be deleted.
            </p>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Breadcrumb Modal */}
      {showBreadcrumb && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Breadcrumb Path
                {selectedCategory && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    for "{selectedCategory.name}"
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowBreadcrumb(false);
                  setSelectedCategory(null);
                  setBreadcrumb([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {breadcrumb.length === 0 ? (
                <p className="text-gray-500 text-sm">No breadcrumb data available</p>
              ) : (
                <div className="flex items-center flex-wrap gap-2">
                  {breadcrumb.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                        <span className="text-xs text-gray-500 font-medium">Level {item.level}</span>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <span className="text-xs text-gray-400">({item.slug})</span>
                      </div>
                      {index < breadcrumb.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowBreadcrumb(false);
                  setSelectedCategory(null);
                  setBreadcrumb([]);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Children Modal */}
      {showChildren && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Subcategories
                {selectedCategory && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    of "{selectedCategory.name}"
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowChildren(false);
                  setSelectedCategory(null);
                  setChildren([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {children.length === 0 ? (
                <p className="text-gray-500 text-sm">No subcategories found</p>
              ) : (
                <div className="space-y-2">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{child.name}</span>
                          {child.isActive !== false ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        {child.description && (
                          <p className="text-sm text-gray-600 mt-1">{child.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Slug: {child.slug}</span>
                          {child.displayOrder !== undefined && (
                            <span>Order: {child.displayOrder}</span>
                          )}
                          {child.children && child.children.length > 0 && (
                            <span>{child.children.length} subcategories</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            handleEditClick(child);
                            setShowChildren(false);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowChildren(false);
                  setSelectedCategory(null);
                  setChildren([]);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManagement;

