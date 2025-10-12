/**
 * Profile page component
 * Displays user profile information and allows editing
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import './ProfilePage.css';

function ProfilePage() {
  const { user: authUser, isAuthenticated, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        setError('Please login to view profile');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await profileService.getProfile();
        
        if (result.success) {
          setProfile(result.data);
          setEditForm({
            firstName: result.data.firstName || '',
            lastName: result.data.lastName || '',
            email: result.data.email || ''
          });
        } else {
          setError(result.error || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Profile loading error:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await updateProfile(editForm);
      
      if (result.success) {
        // Reload profile data
        const profileResult = await profileService.getProfile();
        if (profileResult.success) {
          setProfile(profileResult.data);
        }
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || ''
    });
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'ACTIVE': 'status-active',
      'INACTIVE': 'status-inactive',
      'PENDING': 'status-pending',
      'SUSPENDED': 'status-suspended'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      'USER': 'role-user',
      'ADMIN': 'role-admin',
      'MODERATOR': 'role-moderator'
    };
    
    return (
      <span className={`role-badge ${roleClasses[role] || 'role-default'}`}>
        {role}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-error">
            <h2>Access Denied</h2>
            <p>Please login to view your profile.</p>
            <a href="/login" className="btn btn-primary">Login</a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-error">
            <h2>Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div className="profile-content">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {profile?.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt="Profile Avatar" 
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile?.firstName?.charAt(0)?.toUpperCase() || 
                   profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <button className="btn btn-outline btn-sm">
              Change Avatar
            </button>
          </div>

          {/* Profile Information */}
          <div className="profile-info">
            <div className="profile-section">
              <h3>Basic Information</h3>
              
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={editForm.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      onClick={handleSave} 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-details">
                  <div className="detail-row">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">{profile?.username || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">First Name:</span>
                    <span className="detail-value">{profile?.firstName || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Last Name:</span>
                    <span className="detail-value">{profile?.lastName || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{profile?.email || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Email Verified:</span>
                    <span className="detail-value">
                      {profile?.emailVerified ? (
                        <span className="verified-badge">✓ Verified</span>
                      ) : (
                        <span className="unverified-badge">✗ Not Verified</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">
                      {getRoleBadge(profile?.role)}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {getStatusBadge(profile?.status)}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Member Since:</span>
                    <span className="detail-value">
                      {formatDate(profile?.createdAt)}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {formatDate(profile?.updatedAt)}
                    </span>
                  </div>
                  
                  <div className="profile-actions">
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="btn btn-primary"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;