/**
 * TTS Configuration Management component
 * Manages user's TTS configurations
 */

import React, { useState, useEffect } from 'react';
import ttsConfigService from '../../tts/api';
import { 
  Trash2, 
  Save
} from 'lucide-react';

function TtsConfigManagement() {
  // TTS Config state (user only has one config)
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    languageCode: 'en-US',
    voiceName: 'en-US-Standard-A',
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGain: 0.0,
    sampleRateHertz: 'RATE_24000'
  });

  // Sample rate options
  const sampleRateOptions = [
    { value: 'RATE_8000', label: '8000 Hz' },
    { value: 'RATE_16000', label: '16000 Hz' },
    { value: 'RATE_22050', label: '22050 Hz' },
    { value: 'RATE_24000', label: '24000 Hz (Default)' },
    { value: 'RATE_44100', label: '44100 Hz' },
    { value: 'RATE_48000', label: '48000 Hz' }
  ];

  useEffect(() => {
    loadUserConfig();
  }, []);

  const loadUserConfig = async () => {
    try {
      setLoading(true);
      const result = await ttsConfigService.getUserTtsConfig();
      
      console.log('getUserTtsConfig result:', result);
      
      if (result.success) {
        if (result.data && Object.keys(result.data).length > 0) {
          // User has config - load into form for editing
          console.log('Loading config into form:', result.data);
          setConfig(result.data);
          setFormData({
            name: result.data.name || '',
            description: result.data.description || '',
            languageCode: result.data.languageCode || 'en-US',
            voiceName: result.data.voiceName || 'en-US-Standard-A',
            speakingRate: result.data.speakingRate || 1.0,
            pitch: result.data.pitch || 0.0,
            volumeGain: result.data.volumeGain || 0.0,
            sampleRateHertz: result.data.sampleRateHertz 
              ? (typeof result.data.sampleRateHertz === 'number' 
                ? `RATE_${result.data.sampleRateHertz}` 
                : result.data.sampleRateHertz)
              : 'RATE_24000'
          });
        } else {
          // User doesn't have config - show create form
          console.log('No config found, showing create form');
          setConfig(null);
        }
      } else {
        showMessage(result.error || 'Failed to load TTS configuration', 'error');
      }
    } catch (error) {
      console.error('Error loading TTS config:', error);
      showMessage('Failed to load TTS configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 5000);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let result;

      if (config) {
        // Update existing config
        const updateData = {
          name: formData.name,
          description: formData.description,
          languageCode: formData.languageCode,
          voiceName: formData.voiceName,
          speakingRate: parseFloat(formData.speakingRate),
          pitch: parseFloat(formData.pitch),
          volumeGainDb: parseFloat(formData.volumeGain)
        };

        // Only include optional fields if they're provided
        if (formData.sampleRateHertz) {
          updateData.sampleRateHertz = parseInt(formData.sampleRateHertz.replace('RATE_', ''), 10);
        }

        result = await ttsConfigService.updateTtsConfig(config.id, updateData);
      } else {
        // Create new config
        const createData = {
          name: formData.name,
          description: formData.description,
          languageCode: formData.languageCode,
          voiceName: formData.voiceName,
          speakingRate: parseFloat(formData.speakingRate),
          pitch: parseFloat(formData.pitch),
          volumeGain: parseFloat(formData.volumeGain)
        };

        // Convert sampleRateHertz from "RATE_24000" to integer if provided
        if (formData.sampleRateHertz) {
          createData.sampleRateHertz = formData.sampleRateHertz;
        }

        result = await ttsConfigService.createTtsConfig(createData);
      }

      if (result.success) {
        showMessage(
          config 
            ? 'TTS configuration updated successfully' 
            : 'TTS configuration created successfully',
          'success'
        );
        loadUserConfig();
      } else {
        showMessage(result.error || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error saving TTS config:', error);
      showMessage('Failed to save TTS configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this TTS configuration?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await ttsConfigService.deleteTtsConfig(id);
      
      if (result.success) {
        showMessage('TTS configuration deleted successfully', 'success');
        setConfig(null);
        // Reset form to create mode
        setFormData({
          name: '',
          description: '',
          languageCode: 'en-US',
          voiceName: 'en-US-Standard-A',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGain: 0.0,
          sampleRateHertz: 'RATE_24000'
        });
        loadUserConfig();
      } else {
        showMessage(result.error || 'Failed to delete configuration', 'error');
      }
    } catch (error) {
      console.error('Error deleting TTS config:', error);
      showMessage('Failed to delete TTS configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">TTS Configuration</h2>
        <p className="text-sm text-gray-600 mt-1">
          {config ? 'Edit your Text-to-Speech voice configuration' : 'Create your Text-to-Speech voice configuration'}
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading configuration...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Header with Delete button if config exists */}
            {config && (
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Configuration</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {formatDate(config.createdAt)}
                    {config.updatedAt && ` • Updated: ${formatDate(config.updatedAt)}`}
                    {config.audioEncoding && ` • Encoding: ${config.audioEncoding}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(config.id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-900 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="My TTS Config"
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Configuration for podcast narration"
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.languageCode}
                  onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="en-US"
                  pattern="[a-z]{2}-[A-Z]{2}"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: xx-XX (e.g., en-US, vi-VN)</p>
              </div>

              {/* Voice Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.voiceName}
                  onChange={(e) => setFormData({ ...formData, voiceName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="en-US-Standard-A"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Speaking Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaking Rate <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.speakingRate}
                  onChange={(e) => setFormData({ ...formData, speakingRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  min="0.25"
                  max="4.0"
                  step="0.1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">0.25 - 4.0</p>
              </div>

              {/* Pitch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pitch <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.pitch}
                  onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  min="-20.0"
                  max="20.0"
                  step="0.1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">-20.0 - 20.0</p>
              </div>

              {/* Volume Gain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume Gain (dB) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.volumeGain}
                  onChange={(e) => setFormData({ ...formData, volumeGain: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  min="-96.0"
                  max="16.0"
                  step="0.1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">-96.0 - 16.0</p>
              </div>
            </div>

            {/* Sample Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Rate
              </label>
              <select
                value={formData.sampleRateHertz}
                onChange={(e) => setFormData({ ...formData, sampleRateHertz: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {sampleRateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : config ? 'Update Configuration' : 'Create Configuration'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TtsConfigManagement;