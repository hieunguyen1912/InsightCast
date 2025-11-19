/**
 * Podcast management module component
 * Manages user's podcasts and episodes
 */

import React, { useState, useEffect } from 'react';
import newsService from '../../article/api';
import { Volume2, Download, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { formatDate } from '../../../utils/formatTime';

function PodcastManagement() {
  // Audio files state
  const [audioFiles, setAudioFiles] = useState([]);
  const [audioPagination, setAudioPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });
  const [loadingAudioFiles, setLoadingAudioFiles] = useState(false);
  const [selectedAudioFileId, setSelectedAudioFileId] = useState(null);
  const [audioStatus, setAudioStatus] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioMessage, setAudioMessage] = useState(null);
  const [audioMessageType, setAudioMessageType] = useState(null);

  useEffect(() => {
    loadAudioFiles();
  }, []);

  // Cleanup audio URL blob when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const loadAudioFiles = async (page = 0, size = 10) => {
    try {
      setLoadingAudioFiles(true);
      const result = await newsService.getUserAudioFiles(page, size, 'createdAt', 'desc');
      setAudioFiles(result.content || []);
      setAudioPagination({
        page: result.page || 0,
        size: result.size || 10,
        totalElements: result.totalElements || 0,
        totalPages: result.totalPages || 0
      });
    } catch (error) {
      console.error('Error loading audio files:', error);
    } finally {
      setLoadingAudioFiles(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSelectAndStreamAudio = async (audioFileId) => {
    if (!audioFileId) return;
    
    try {
      setLoadingAudioFiles(true);
      setSelectedAudioFileId(audioFileId);
      
      // Revoke old audio URL nếu có
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      
      // Check status của audio file được chọn
      const statusResult = await newsService.checkAudioStatus(audioFileId);
      
      if (statusResult.success && statusResult.data) {
        const status = statusResult.data.status;
        
        setAudioStatus(status);
        
        if (status === 'COMPLETED') {
          // Load audio URL để stream
          const url = await newsService.getAudioStreamUrl(audioFileId);
          if (url) {
            setAudioUrl(url);
            setAudioMessage(null);
            setAudioMessageType(null);
          } else {
            setAudioMessage('Failed to load audio stream.');
            setAudioMessageType('error');
            setTimeout(() => {
              setAudioMessage(null);
              setAudioMessageType(null);
            }, 5000);
          }
        } else if (status === 'GENERATING_AUDIO') {
          setAudioMessage('Audio is still being generated. Please wait...');
          setAudioMessageType('info');
        } else if (status === 'FAILED') {
          const errorMsg = statusResult.data.errorMessage || 'Audio generation failed';
          setAudioMessage(`This audio file generation failed: ${errorMsg}`);
          setAudioMessageType('error');
          setTimeout(() => {
            setAudioMessage(null);
            setAudioMessageType(null);
          }, 5000);
        }
      } else {
        setAudioMessage('Failed to check audio status.');
        setAudioMessageType('error');
        setTimeout(() => {
          setAudioMessage(null);
          setAudioMessageType(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error selecting audio:', error);
      setAudioMessage('Failed to load audio file.');
      setAudioMessageType('error');
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 5000);
    } finally {
      setLoadingAudioFiles(false);
    }
  };

  const handleDownloadAudio = async (audioFileId) => {
    if (!audioFileId) return;

    try {
      const blob = await newsService.downloadAudio(audioFileId);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audio-${audioFileId}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      setAudioMessage('Audio file downloaded successfully!');
      setAudioMessageType('success');
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 3000);
    } catch (error) {
      console.error('Error downloading audio:', error);
      setAudioMessage('Failed to download audio file.');
      setAudioMessageType('error');
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 5000);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < audioPagination.totalPages) {
      loadAudioFiles(newPage, audioPagination.size);
    }
  };

  const handleDeleteAudio = async (audioFileId, e) => {
    e.stopPropagation(); // Prevent triggering audio selection
    
    if (!window.confirm('Are you sure you want to delete this audio file? This action cannot be undone.')) {
      return;
    }

    try {
      setLoadingAudioFiles(true);
      const result = await newsService.deleteAudio(audioFileId);
      
      if (result.success) {
        // Remove deleted audio from list
        setAudioFiles(prev => prev.filter(audio => audio.id !== audioFileId));
        
        // Update pagination total
        setAudioPagination(prev => ({
          ...prev,
          totalElements: prev.totalElements - 1
        }));
        
        // If deleted audio was selected, clear selection
        if (selectedAudioFileId === audioFileId) {
          setSelectedAudioFileId(null);
          setAudioStatus(null);
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
          }
        }
        
        setAudioMessage('Audio file deleted successfully.');
        setAudioMessageType('success');
        setTimeout(() => {
          setAudioMessage(null);
          setAudioMessageType(null);
        }, 3000);
      } else {
        let errorMsg = result.error || 'Failed to delete audio file';
        
        if (result.status === 403) {
          errorMsg = 'You do not have permission to delete this audio file.';
        } else if (result.status === 404) {
          errorMsg = 'Audio file not found.';
        } else if (result.status === 400) {
          errorMsg = result.error || 'Invalid request.';
        }
        
        setAudioMessage(errorMsg);
        setAudioMessageType('error');
        setTimeout(() => {
          setAudioMessage(null);
          setAudioMessageType(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error deleting audio:', error);
      setAudioMessage('An unexpected error occurred while deleting the audio file.');
      setAudioMessageType('error');
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 5000);
    } finally {
      setLoadingAudioFiles(false);
    }
  };

  return (
    <div className="podcast-management">
      {/* Audio Files Section */}
      <div className="audio-files-section">


        {audioMessage && (
          <div className={`module-message ${audioMessageType === 'error' ? 'module-error' : audioMessageType === 'success' ? 'module-success' : 'module-info'}`} style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
            <p>{audioMessage}</p>
            <button 
              onClick={() => {
                setAudioMessage(null);
                setAudioMessageType(null);
              }} 
              className="btn btn-outline btn-sm"
              style={{ marginLeft: '1rem' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {loadingAudioFiles && audioFiles.length === 0 ? (
          <div className="module-loading">
            <div className="loading-spinner"></div>
            <p>Loading audio files...</p>
          </div>
        ) : audioFiles.length > 0 ? (
          <>
            {/* Audio Files List */}
            <div className="audio-files-list" style={{ marginBottom: '2rem' }}>
              {audioFiles.map((audioFile) => (
                <div
                  key={audioFile.id}
                  onClick={() => !loadingAudioFiles && handleSelectAndStreamAudio(audioFile.id)}
                  className={`audio-file-card ${selectedAudioFileId === audioFile.id ? 'selected' : ''}`}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    border: selectedAudioFileId === audioFile.id ? '2px solid #f97316' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: selectedAudioFileId === audioFile.id ? '#fff7ed' : '#fff',
                    cursor: loadingAudioFiles ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loadingAudioFiles ? 0.5 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#111827' }}>
                          Audio #{audioFile.id}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            backgroundColor:
                              audioFile.status === 'COMPLETED'
                                ? '#dcfce7'
                                : audioFile.status === 'GENERATING_AUDIO'
                                ? '#fef3c7'
                                : audioFile.status === 'FAILED'
                                ? '#fee2e2'
                                : '#f3f4f6',
                            color:
                              audioFile.status === 'COMPLETED'
                                ? '#166534'
                                : audioFile.status === 'GENERATING_AUDIO'
                                ? '#92400e'
                                : audioFile.status === 'FAILED'
                                ? '#991b1b'
                                : '#374151'
                          }}
                        >
                          {audioFile.status || 'UNKNOWN'}
                        </span>
                        {selectedAudioFileId === audioFile.id && audioStatus === 'COMPLETED' && (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}>
                            ● Playing
                          </span>
                        )}
                      </div>
                      {audioFile.fileName && (
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          File: {audioFile.fileName}
                        </p>
                      )}
                      {audioFile.createdAt && (
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          Created: {formatDate(audioFile.createdAt)}
                        </p>
                      )}
                      {audioFile.articleId && (
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Article ID: {audioFile.articleId}
                        </p>
                      )}
                      {audioFile.errorMessage && (
                        <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem' }}>
                          Error: {audioFile.errorMessage}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', alignItems: 'center' }}>
                      {audioFile.status === 'COMPLETED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAudio(audioFile.id);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title="Download audio"
                        >
                          <Download size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteAudio(audioFile.id, e)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', color: '#dc2626', borderColor: '#dc2626' }}
                        title="Delete audio"
                        disabled={loadingAudioFiles}
                      >
                        <Trash2 size={14} />
                      </button>
                      {selectedAudioFileId === audioFile.id && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }}></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {audioPagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => handlePageChange(audioPagination.page - 1)}
                  disabled={audioPagination.page === 0}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Page {audioPagination.page + 1} of {audioPagination.totalPages} ({audioPagination.totalElements} total)
                </span>
                <button
                  onClick={() => handlePageChange(audioPagination.page + 1)}
                  disabled={audioPagination.page >= audioPagination.totalPages - 1}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Audio Player */}
            {audioStatus === 'COMPLETED' && selectedAudioFileId && audioUrl && (
              <div style={{
                marginTop: '2rem',
                padding: '1.25rem',
                background: 'linear-gradient(to right, #fff7ed, #ffedd5)',
                border: '1px solid #fed7aa',
                borderRadius: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Volume2 size={20} color="#f97316" />
                    Audio Player
                  </h4>
                  <button
                    onClick={() => handleDownloadAudio(selectedAudioFileId)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem' }}
                    title="Download audio file"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
                <audio
                  controls
                  style={{ width: '100%' }}
                  src={audioUrl}
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.75rem' }}>
                  Audio file is ready. Click play to listen.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="no-audio-files" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
              No audio files yet
            </h3>
            <p style={{ color: '#6b7280' }}>
              Generate audio from your articles to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PodcastManagement;
