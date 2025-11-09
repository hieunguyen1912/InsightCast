/**
 * Role Permission Management Component
 * Admin component for managing roles and permissions
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Shield,
  Save,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button, Input, Spinner, Alert, ConfirmModal, StatusBadge, Modal } from '../../../components/common';
import adminService from '../api';

/**
 * RolePermissionManagement component
 * @param {Object} props
 * @param {Function} props.onStatsChange - Callback when stats change
 */
function RolePermissionManagement({ onStatsChange }) {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, roleId: null, roleName: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use getAllRoles for non-paginated list (better for admin management)
      const result = await adminService.getAllRoles();
      
      if (result.success) {
        const roleData = result.data?.data || result.data || [];
        setRoles(Array.isArray(roleData) ? roleData : []);
      } else {
        setError(result.error || 'Failed to load roles');
        setRoles([]);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('An unexpected error occurred');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      // Use getAllPermissions for non-paginated list (needed for checkbox selection)
      const result = await adminService.getAllPermissions();
      if (result.success) {
        const permData = result.data?.data || result.data || [];
        setPermissions(Array.isArray(permData) ? permData : []);
      }
    } catch (err) {
      console.error('Error loading permissions:', err);
    }
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true
    });
    setRolePermissions([]);
  };

  const handleEditClick = async (role) => {
    setEditingRole(role);
    setIsCreating(false);
    setFormData({
      name: role.name || '',
      code: role.code || '', // Display code but cannot edit
      description: role.description || '',
      isActive: role.isActive !== undefined ? role.isActive : true
    });

    try {
      const result = await adminService.getRolePermissions(role.id);
      if (result.success) {
        const permData = result.data?.data || result.data || [];
        const permIds = Array.isArray(permData) 
          ? permData.map(p => p.id || p)
          : [];
        setRolePermissions(permIds);
      }
    } catch (err) {
      console.error('Error loading role permissions:', err);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true
    });
    setRolePermissions([]);
  };

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }

    // Validate code for new roles
    if (!editingRole && !formData.code.trim()) {
      setError('Role code is required');
      return;
    }

    try {
      let result;
      
      if (editingRole) {
        // Update role (code cannot be updated)
        result = await adminService.updateRole(editingRole.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          isActive: formData.isActive
        });
      } else {
        // Create role (code is required)
        result = await adminService.createRole({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || null,
          isActive: formData.isActive
        });
      }

      if (result.success) {
        await loadRoles();
        handleCancel();
        if (onStatsChange) onStatsChange();
        setError(null);
      } else {
        setError(result.error || 'Failed to save role');
      }
    } catch (err) {
      console.error('Error saving role:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;

    try {
      const result = await adminService.updateRolePermissions(editingRole.id, rolePermissions);
      
      if (result.success) {
        await loadRoles();
        setError(null);
      } else {
        setError(result.error || 'Failed to update permissions');
      }
    } catch (err) {
      console.error('Error updating permissions:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteClick = (roleId, roleName) => {
    setDeleteConfirmation({
      isOpen: true,
      roleId,
      roleName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.roleId) return;
    
    try {
      const result = await adminService.deleteRole(deleteConfirmation.roleId);
      
      if (result.success) {
        await loadRoles();
        setDeleteConfirmation({ isOpen: false, roleId: null, roleName: '' });
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to delete role');
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, roleId: null, roleName: '' });
  };

  const handleActivateRole = async (roleId) => {
    try {
      const result = await adminService.activateRole(roleId);
      
      if (result.success) {
        await loadRoles();
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to activate role');
      }
    } catch (err) {
      console.error('Error activating role:', err);
      setError('An unexpected error occurred');
    }
  };

  const togglePermission = (permissionId) => {
    if (rolePermissions.includes(permissionId)) {
      setRolePermissions(rolePermissions.filter(id => id !== permissionId));
    } else {
      setRolePermissions([...rolePermissions, permissionId]);
    }
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
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Roles & Permissions</h2>
          <p className="text-sm text-gray-600">Manage system roles and their permissions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadRoles}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          
          {!isCreating && !editingRole && (
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Role
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

      {/* Create/Edit Role Form Modal */}
      <Modal
        isOpen={isCreating || !!editingRole}
        onClose={handleCancel}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveRole}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter role name (e.g., Administrator)"
                  className="w-full"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.name.length}/50 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Code {!editingRole && '*'}
                </label>
                {editingRole ? (
                  <Input
                    type="text"
                    value={formData.code}
                    disabled
                    className="w-full bg-gray-100 cursor-not-allowed"
                    title="Code cannot be changed after creation"
                  />
                ) : (
                  <>
                    <Input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., ADMIN, MODERATOR"
                      className="w-full uppercase"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Uppercase letters, numbers, underscores only (e.g., ADMIN, USER_READ)
                    </p>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter role description (optional, max 255 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/255 characters
              </p>
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
            
            {editingRole && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {permissions.length === 0 ? (
                    <p className="text-sm text-gray-500">No permissions available</p>
                  ) : (
                    <div className="space-y-2">
                      {permissions.map(permission => (
                        <label
                          key={permission.id}
                          className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={rolePermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {permission.name}
                          </span>
                          {permission.description && (
                            <span className="text-xs text-gray-500">
                              {permission.description}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSavePermissions}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save Permissions
                </button>
              </div>
            )}
          </div>
      </Modal>

      {/* Roles List */}
      {roles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Roles Found</h3>
          <p className="text-gray-600 mb-4">
            {isCreating 
              ? 'Fill out the form above to create a role'
              : 'Get started by creating your first role'
            }
          </p>
          {!isCreating && (
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Role
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
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {role.code || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {role.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        status={role.isActive ? 'active' : 'inactive'}
                        variant={role.isActive ? 'success' : 'danger'}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {role.permissions?.length || 0} permission{role.permissions?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(role)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit role and permissions"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {!role.isActive && (
                          <button
                            onClick={() => handleActivateRole(role.id)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activate role"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(role.id, role.name)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete role"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message={
          <div className="space-y-2">
            <p className="text-gray-700">
              Are you sure you want to delete role <strong>"{deleteConfirmation.roleName}"</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone. Users with this role will lose access.
            </p>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default RolePermissionManagement;

