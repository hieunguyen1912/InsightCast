/**
 * Settings module component for dashboard
 * Manages user preferences and account settings
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../api';

function SettingsModule() {
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      newEpisodeAlerts: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showActivity: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const result = await profileService.getSettings();
        if (result.success) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error('Settings loading error:', error);
        // Use default settings if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const result = await profileService.updateSettings(settings);
      if (result.success) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          weeklyDigest: true,
          newEpisodeAlerts: true
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showActivity: true
        },
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC'
        }
      });
    }
  };

  return (
    <div className="settings-module">
      <div className="module-header">
        <h2>Settings</h2>
        <p>Manage your account preferences and privacy settings</p>
      </div>

      {error && (
        <div className="module-error">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="btn btn-outline btn-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="module-success">
          <p>{success}</p>
        </div>
      )}

      <div className="settings-content">
        {/* Notifications Settings */}
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Receive browser push notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Weekly Digest</h4>
                <p>Get a weekly summary of your activity</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklyDigest}
                  onChange={(e) => handleSettingChange('notifications', 'weeklyDigest', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>New Episode Alerts</h4>
                <p>Get notified when new episodes are published</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.newEpisodeAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'newEpisodeAlerts', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-section">
          <h3>Privacy</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Profile Visibility</h4>
                <p>Control who can see your profile</p>
              </div>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                className="form-select"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Show Email</h4>
                <p>Display your email on your profile</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showEmail}
                  onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Show Activity</h4>
                <p>Display your recent activity on your profile</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showActivity}
                  onChange={(e) => handleSettingChange('privacy', 'showActivity', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <h3>Preferences</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Theme</h4>
                <p>Choose your preferred theme</p>
              </div>
              <select
                value={settings.preferences.theme}
                onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                className="form-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Language</h4>
                <p>Select your preferred language</p>
              </div>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                className="form-select"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Timezone</h4>
                <p>Set your timezone for accurate timestamps</p>
              </div>
              <select
                value={settings.preferences.timezone}
                onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                className="form-select"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Asia/Ho_Chi_Minh">Vietnam Time</option>
                <option value="Europe/London">London Time</option>
                <option value="Europe/Paris">Paris Time</option>
                <option value="Asia/Tokyo">Tokyo Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <button 
            onClick={handleSaveSettings}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          <button 
            onClick={handleResetSettings}
            className="btn btn-outline"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModule;
