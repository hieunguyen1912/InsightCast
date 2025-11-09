/**
 * Podcast management module component
 * Manages user's podcasts and episodes
 */

import React, { useState, useEffect } from 'react';
import { podcastService } from '../../podcast/api';

function PodcastManagement() {
  const [podcasts, setPodcasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPodcast, setNewPodcast] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  });

  useEffect(() => {
    const loadPodcasts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await podcastService.getUserPodcasts();
        if (result.success) {
          setPodcasts(result.data);
        } else {
          setError(result.error || 'Failed to load podcasts');
        }
      } catch (error) {
        console.error('Podcast loading error:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadPodcasts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPodcast(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePodcast = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const result = await podcastService.createPodcast(newPodcast);
      if (result.success) {
        setPodcasts(prev => [result.data, ...prev]);
        setNewPodcast({ title: '', description: '', category: '', tags: '' });
        setShowCreateForm(false);
      } else {
        setError(result.error || 'Failed to create podcast');
      }
    } catch (error) {
      console.error('Podcast creation error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePodcast = async (podcastId) => {
    if (!window.confirm('Are you sure you want to delete this podcast?')) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await podcastService.deletePodcast(podcastId);
      if (result.success) {
        setPodcasts(prev => prev.filter(p => p.id !== podcastId));
      } else {
        setError(result.error || 'Failed to delete podcast');
      }
    } catch (error) {
      console.error('Podcast deletion error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading && podcasts.length === 0) {
    return (
      <div className="podcast-management">
        <div className="module-loading">
          <div className="loading-spinner"></div>
          <p>Loading podcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="podcast-management">
      <div className="module-header">
        <h2>My Podcasts</h2>
        <p>Manage your podcast content and episodes</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Podcast
        </button>
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

      {/* Create Podcast Form */}
      {showCreateForm && (
        <div className="create-podcast-form">
          <h3>Create New Podcast</h3>
          <form onSubmit={handleCreatePodcast}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newPodcast.title}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newPodcast.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={newPodcast.category}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select a category</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="News">News</option>
                <option value="Sports">Sports</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={newPodcast.tags}
                onChange={handleInputChange}
                className="form-input"
                placeholder="podcast, technology, AI"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Podcast'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Podcasts List */}
      <div className="podcasts-list">
        {podcasts.length > 0 ? (
          <div className="podcasts-grid">
            {podcasts.map(podcast => (
              <div key={podcast.id} className="podcast-card">
                <div className="podcast-header">
                  <h3>{podcast.title}</h3>
                  <div className="podcast-actions">
                    <button className="btn btn-outline btn-sm">Edit</button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePodcast(podcast.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="podcast-content">
                  <p className="podcast-description">{podcast.description}</p>
                  
                  <div className="podcast-meta">
                    <span className="podcast-category">{podcast.category}</span>
                    <span className="podcast-episodes">
                      {podcast.episodeCount || 0} episodes
                    </span>
                    <span className="podcast-date">
                      Created {formatDate(podcast.createdAt)}
                    </span>
                  </div>

                  {podcast.tags && (
                    <div className="podcast-tags">
                      {podcast.tags.split(',').map((tag, index) => (
                        <span key={index} className="tag">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="podcast-footer">
                  <button className="btn btn-primary btn-sm">
                    Add Episode
                  </button>
                  <button className="btn btn-outline btn-sm">
                    View Episodes
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-podcasts">
            <div className="no-podcasts-icon">🎧</div>
            <h3>No podcasts yet</h3>
            <p>Create your first podcast to get started!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Podcast
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PodcastManagement;
