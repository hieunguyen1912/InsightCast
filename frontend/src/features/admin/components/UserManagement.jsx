/**
 * User Management Component
 * Admin component for managing users
 */

import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Trash2, 
  RefreshCw,
  Search as SearchIcon,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { Button, Input, Spinner, Alert, ConfirmModal, Modal, StatusBadge } from '../../../components/common';
import adminService from '../api';
import { formatDateForAPI } from '../../../utils/formatTime';


function UserManagement({ onStatsChange }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    email: '',
    username: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, userId: null, userName: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editMode, setEditMode] = useState('roles'); // 'roles' or 'info'
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  
  // Form state for editing user info
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    avatarUrl: ''
  });

  // Load roles once on mount
  useEffect(() => {
    loadRoles();
  }, []);

  // Load users when page or filters change (with debounce for email/username)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, filters.email || filters.username ? 500 : 0); // Debounce only for text inputs

    return () => clearTimeout(timer);
  }, [currentPage, filters.status, filters.email, filters.username]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        size: 10,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      };

      // Add filters if provided
      if (filters.status) params.status = filters.status;
      if (filters.email) params.email = filters.email;
      if (filters.username) params.username = filters.username;

      const result = await adminService.getUsers(params);
      
      if (result.success) {
        const data = result.data?.data || result.data || {};
        const userList = data.content || data.items || data || [];
        setUsers(Array.isArray(userList) ? userList : []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setError(result.error || 'Failed to load users');
        setUsers([]);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('An unexpected error occurred');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const result = await adminService.getAllRoles();
      if (result.success) {
        const roleData = result.data?.data || result.data || [];
        setRoles(Array.isArray(roleData) ? roleData : []);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  const handleEditClick = async (user, mode = 'roles') => {
    setEditingUser(user);
    setEditMode(mode);
    
    if (mode === 'roles') {
      try {
        const result = await adminService.getUserRoles(user.id);
        if (result.success) {
          const roleData = result.data?.data || result.data || [];
          setUserRoles(Array.isArray(roleData) ? roleData.map(r => r.id || r) : []);
        }
      } catch (err) {
        console.error('Error loading user roles:', err);
      }
    } else if (mode === 'info') {
      // Populate form with user data
      // Format dateOfBirth to YYYY-MM-DD for input type="date"
      const dateOfBirthFormatted = user.dateOfBirth 
        ? formatDateForAPI(user.dateOfBirth) || ''
        : '';
      
      setUserFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: dateOfBirthFormatted,
        avatarUrl: user.avatarUrl || ''
      });
    }
  };

  const handleSaveUserRoles = async () => {
    if (!editingUser) return;

    try {
      const result = await adminService.updateUserRoles(editingUser.id, userRoles);
      
      if (result.success) {
        await loadUsers();
        setEditingUser(null);
        setUserRoles([]);
        setEditMode('roles');
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to update user roles');
      }
    } catch (err) {
      console.error('Error updating user roles:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleSaveUserInfo = async () => {
    if (!editingUser) return;

    try {
      // Prepare payload with only non-empty fields
      const payload = {};
      if (userFormData.username.trim()) payload.username = userFormData.username.trim();
      if (userFormData.email.trim()) payload.email = userFormData.email.trim();
      if (userFormData.firstName.trim()) payload.firstName = userFormData.firstName.trim();
      if (userFormData.lastName.trim()) payload.lastName = userFormData.lastName.trim();
      if (userFormData.phoneNumber.trim()) payload.phoneNumber = userFormData.phoneNumber.trim();
      // Format dateOfBirth to YYYY-MM-DD for API (LocalDate)
      if (userFormData.dateOfBirth.trim()) {
        const formattedDate = formatDateForAPI(userFormData.dateOfBirth);
        if (formattedDate) payload.dateOfBirth = formattedDate;
      }
      if (userFormData.avatarUrl.trim()) payload.avatarUrl = userFormData.avatarUrl.trim();
      
      // Include version field if it exists in editingUser
      if (editingUser.version !== undefined) {
        payload.version = editingUser.version;
      }

      const result = await adminService.updateUser(editingUser.id, payload);
      
      if (result.success) {
        await loadUsers();
        setEditingUser(null);
        setUserFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          dateOfBirth: '',
          avatarUrl: ''
        });
        setEditMode('roles');
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to update user information');
      }
    } catch (err) {
      console.error('Error updating user info:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteClick = (userId, userName) => {
    setDeleteConfirmation({
      isOpen: true,
      userId,
      userName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.userId) return;
    
    try {
      const result = await adminService.deleteUser(deleteConfirmation.userId);
      
      if (result.success) {
        await loadUsers();
        setDeleteConfirmation({ isOpen: false, userId: null, userName: '' });
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, userId: null, userName: '' });
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const result = await adminService.updateUserStatus(userId, newStatus);
      
      if (result.success) {
        await loadUsers();
        if (onStatsChange) onStatsChange();
      } else {
        setError(result.error || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      email: '',
      username: '',
      status: ''
    });
    setCurrentPage(0);
  };

  const getRoleNames = (user) => {
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.map(r => r.name || r).join(', ') || 'No roles';
    }
    return 'No roles';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Users Management</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showFilters 
                  ? 'bg-orange-500 text-white border-orange-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="DELETED">Deleted</option>
                </select>
              </div>

              {/* Email Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.email}
                    onChange={(e) => handleFilterChange('email', e.target.value)}
                    placeholder="Search by email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Case-insensitive search</p>
              </div>

              {/* Username Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.username}
                    onChange={(e) => handleFilterChange('username', e.target.value)}
                    placeholder="Search by username..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Case-insensitive search</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Edit User Roles Modal */}
      {editMode === 'roles' && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => {
            setEditingUser(null);
            setUserRoles([]);
            setEditMode('roles');
          }}
          title={`Edit Roles for ${editingUser ? (editingUser.firstName || editingUser.username || editingUser.email) : ''}`}
          size="md"
          footer={
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingUser(null);
                  setUserRoles([]);
                  setEditMode('roles');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveUserRoles}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Roles
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {roles.map(role => (
                  <label key={role.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userRoles.includes(role.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUserRoles([...userRoles, role.id]);
                        } else {
                          setUserRoles(userRoles.filter(id => id !== role.id));
                        }
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Info Modal */}
      {editMode === 'info' && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => {
            setEditingUser(null);
            setUserFormData({
              username: '',
              email: '',
              firstName: '',
              lastName: '',
              phoneNumber: '',
              dateOfBirth: '',
              avatarUrl: ''
            });
            setEditMode('roles');
          }}
          title={`Edit User Information`}
          size="lg"
          footer={
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingUser(null);
                  setUserFormData({
                    username: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    phoneNumber: '',
                    dateOfBirth: '',
                    avatarUrl: ''
                  });
                  setEditMode('roles');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveUserInfo}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Letters, numbers, and underscores only (3-50 characters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="Enter email"
                  className="w-full"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  type="text"
                  value={userFormData.firstName}
                  onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  className="w-full"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  value={userFormData.lastName}
                  onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  className="w-full"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="text"
                  value={userFormData.phoneNumber}
                  onChange={(e) => setUserFormData({ ...userFormData, phoneNumber: e.target.value })}
                  placeholder="e.g., +1234567890"
                  className="w-full"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: +[country code][number]
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={userFormData.dateOfBirth}
                  onChange={(e) => setUserFormData({ ...userFormData, dateOfBirth: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: yyyy-MM-dd
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <Input
                type="url"
                value={userFormData.avatarUrl}
                onChange={(e) => setUserFormData({ ...userFormData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full"
              />
              {userFormData.avatarUrl && (
                <div className="mt-2">
                  <img 
                    src={userFormData.avatarUrl} 
                    alt="Avatar preview" 
                    className="w-16 h-16 rounded-full object-cover border border-gray-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">
            {(filters.email || filters.username || filters.status)
              ? 'No users match your filter criteria' 
              : 'No users found in the system'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.username || user.email || 'Unknown'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username || 'no-username'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? (
                          user.roles.map((role, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              {role.name || role}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge 
                          status={user.status?.toLowerCase() || 'active'}
                          variant={
                            user.status === 'ACTIVE' ? 'success' :
                            user.status === 'INACTIVE' ? 'warning' :
                            user.status === 'SUSPENDED' ? 'danger' :
                            user.status === 'DELETED' ? 'danger' : 'default'
                          }
                        />
                        <select
                          value={user.status || 'ACTIVE'}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          title="Change user status"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="DELETED">DELETED</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(user, 'info')}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit user information"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(user, 'roles')}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit user roles"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user.id, user.firstName || user.username || user.email)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {users.length} of {totalElements} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={
          <div className="space-y-2">
            <p className="text-gray-700">
              Are you sure you want to delete user <strong>"{deleteConfirmation.userName}"</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone.
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

export default UserManagement;

