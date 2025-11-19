import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Share2, 
  Bookmark,
  Volume2,
  Loader2,
  Download,
  FileText
} from 'lucide-react';
import newsService from '../api';
import { formatNewsTime, formatDate } from '../../../utils/formatTime';
import { ArticleCard } from '../../../components/cards';
import Alert from '../../../components/common/Alert';
import Modal from '../../../components/common/Modal';
import { Input } from '../../../components/common';
import CommentSection from '../../comment/components/CommentSection';

function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState(null);
  const [audioMessageType, setAudioMessageType] = useState(null); // 'success' | 'error'
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showSummaryAudioModal, setShowSummaryAudioModal] = useState(false);
  const [useDefaultConfig, setUseDefaultConfig] = useState(true);
  const [useDefaultConfigForSummary, setUseDefaultConfigForSummary] = useState(true);
  const [audioFileId, setAudioFileId] = useState(null);
  const [audioStatus, setAudioStatus] = useState(null); // 'GENERATING_AUDIO' | 'COMPLETED' | 'FAILED'
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]); // Danh sách audio files của article
  const [selectedAudioFileId, setSelectedAudioFileId] = useState(null); // Audio được chọn để stream
  const [loadingAudioFiles, setLoadingAudioFiles] = useState(false);
  const [customVoiceSettings, setCustomVoiceSettings] = useState({
    languageCode: 'en-US',
    voiceName: 'en-US-Standard-B',
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGain: 0.0,
    audioEncoding: 'MP3',
    sampleRateHertz: 'RATE_24000' // Enum value instead of number
  });
  const [customVoiceSettingsForSummary, setCustomVoiceSettingsForSummary] = useState({
    languageCode: 'en-US',
    voiceName: 'en-US-Standard-B',
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGain: 0.0,
    audioEncoding: 'MP3',
    sampleRateHertz: 'RATE_24000' // Enum value instead of number
  });

  // Cleanup audio URL blob when component unmounts or audioUrl changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch article detail and related articles in parallel
        const [articleData, relatedData] = await Promise.all([
          newsService.getArticleById(id),
          newsService.getRelatedArticles(id, 4) // Get related articles
        ]);
        
        setArticle(articleData);
        setRelatedArticles(relatedData);
        
        // Check if article is already in favorites
        // Fetch first page with larger size to find the article
        const favoritesResult = await newsService.getArticleFavorites(0, 50, 'updatedAt', 'desc');
        const existingFavorite = favoritesResult.content?.find(fav => fav.articleId === parseInt(id));
        if (existingFavorite) {
          setIsBookmarked(true);
          setFavoriteId(existingFavorite.id);
        }
        
        // Fetch audio files for this article
        const audioFilesList = await newsService.getArticleAudioFiles(id);
        setAudioFiles(audioFilesList);
        
        // Nếu có audio files, tự động chọn audio COMPLETED đầu tiên (hoặc latest)
        if (audioFilesList.length > 0) {
          // Tìm audio COMPLETED đầu tiên
          const completedAudio = audioFilesList.find(a => a.status === 'COMPLETED');
          if (completedAudio) {
            setSelectedAudioFileId(completedAudio.id);
            // Load audio URL ngay lập tức
            newsService.getAudioStreamUrl(completedAudio.id).then(url => {
              if (url) {
                setAudioUrl(url);
                setAudioStatus('COMPLETED');
                setAudioFileId(completedAudio.id);
              }
            }).catch(err => {
              console.error('Error loading audio URL:', err);
            });
          } else {
            // Nếu không có COMPLETED, chọn audio đầu tiên (có thể đang GENERATING)
            const firstAudio = audioFilesList[0];
            setSelectedAudioFileId(firstAudio.id);
            if (firstAudio.status === 'GENERATING_AUDIO') {
              setAudioStatus('GENERATING_AUDIO');
              setAudioFileId(firstAudio.id);
              // Start polling nếu đang generating
              startStatusPolling(firstAudio.id);
            }
          }
        }
        
        // Track article view (non-blocking)
        newsService.trackArticleView(id).catch(err => {
          console.error('Failed to track article view:', err);
        });
        
      } catch (err) {
        console.error('Error fetching article detail:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticleDetail();
    }
  }, [id]);

  const handleBookmark = async () => {
    if (!article) return;
    
    try {
      if (isBookmarked && favoriteId) {
        // Remove from favorites
        const result = await newsService.removeArticleFromFavorites(favoriteId);
        if (result.success) {
          setIsBookmarked(false);
          setFavoriteId(null);
        } else {
          console.error('Error removing from favorites:', result.error);
          // Optionally show error message to user
        }
      } else {
        // Add to favorites
        const result = await newsService.addArticleToFavorites(article.id);
        if (result.success && result.data) {
          setIsBookmarked(true);
          setFavoriteId(result.data.id);
        } else {
          console.error('Error adding to favorites:', result.error);
          // Optionally show error message to user
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // TODO: Show toast notification
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleTTS = () => {
    // Open modal to choose between default config or custom settings
    if (!article) {
      setAudioMessage('Article data is still loading. Please wait a moment and try again.');
      setAudioMessageType('error');
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 5000);
      return;
    }
    setShowAudioModal(true);
  };

  const handleTTSSummary = () => {
    // Open modal for generating audio from summary
    if (!article) {
      setAudioMessage('Article data is still loading. Please wait a moment and try again.');
      setAudioMessageType('error');
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 5000);
      return;
    }
    setShowSummaryAudioModal(true);
  };

  const handleGenerateAudio = async () => {
    // Use id from URL params as primary source, fallback to article.id
    const articleId = id || article?.id;
    
    if (!articleId) {
      console.error('Article ID not found. URL id:', id, 'Article:', article);
      setAudioMessage('Article ID not found. Please refresh the page and try again.');
      setAudioMessageType('error');
      setShowAudioModal(false);
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 5000);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setAudioMessage(null);
      setAudioMessageType(null);
      setShowAudioModal(false);

      // Prepare options
      const options = {
        enableSummarization: true,
        enableTranslation: false
      };

      // Add custom voice settings if not using default
      if (!useDefaultConfig) {
        options.customVoiceSettings = customVoiceSettings;
      }

      // Call the API to generate audio
      const result = await newsService.generateAudio(articleId, options);

      if (result.success) {
        // Save audio file ID for status checking
        const generatedAudioFileId = result.data?.id;
        if (generatedAudioFileId) {
          setAudioFileId(generatedAudioFileId);
          setSelectedAudioFileId(generatedAudioFileId);
          setAudioStatus('GENERATING_AUDIO');
          setAudioProgress(0);
          // Start polling for status
          startStatusPolling(generatedAudioFileId);
          
          // Refresh audio files list để hiển thị audio mới
          const updatedAudioFiles = await newsService.getArticleAudioFiles(articleId);
          setAudioFiles(updatedAudioFiles);
        }
        
        setAudioMessage(
          result.message || 'Audio generation started. Tracking progress...'
        );
        setAudioMessageType('success');
        
        // Don't clear message immediately if we're tracking progress
        if (!generatedAudioFileId) {
          setTimeout(() => {
            setAudioMessage(null);
            setAudioMessageType(null);
          }, 8000);
        }
      } else {
        // Handle different error cases
        let errorMsg = result.error || 'Failed to generate audio';
        
        if (result.status === 403) {
          errorMsg = 'You do not have permission to generate audio for this article. Only the article author can generate audio.';
        } else if (result.status === 404) {
          errorMsg = 'Endpoint not found. The audio generation feature may not be available yet. Please contact the administrator.';
        } else if (result.errorCode === 'TTS_CONFIG_NO_DEFAULT') {
          errorMsg = 'No default TTS configuration found. Please provide custom voice settings or configure your default TTS settings.';
        } else if (result.status === 400) {
          errorMsg = result.error || 'Invalid request. Please check your input.';
        } else if (result.status >= 500) {
          errorMsg = 'Server error occurred. Please try again later.';
        }

        setAudioMessage(errorMsg);
        setAudioMessageType('error');
        
        // Clear error message after 8 seconds
        setTimeout(() => {
          setAudioMessage(null);
          setAudioMessageType(null);
        }, 8000);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      setAudioMessage('An unexpected error occurred. Please try again.');
      setAudioMessageType('error');
      
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 8000);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleGenerateAudioFromSummary = async () => {
    // Use id from URL params as primary source, fallback to article.id
    const articleId = id || article?.id;
    
    if (!articleId) {
      console.error('Article ID not found. URL id:', id, 'Article:', article);
      setAudioMessage('Article ID not found. Please refresh the page and try again.');
      setAudioMessageType('error');
      setShowSummaryAudioModal(false);
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 5000);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setAudioMessage(null);
      setAudioMessageType(null);
      setShowSummaryAudioModal(false);

      // Prepare options
      const options = {};

      // Add custom voice settings if not using default
      if (!useDefaultConfigForSummary) {
        options.customVoiceSettings = customVoiceSettingsForSummary;
      }

      // Call the API to generate audio from summary
      const result = await newsService.generateAudioFromSummary(articleId, options);

      if (result.success) {
        // Save audio file ID for status checking
        const generatedAudioFileId = result.data?.id;
        if (generatedAudioFileId) {
          setAudioFileId(generatedAudioFileId);
          setSelectedAudioFileId(generatedAudioFileId);
          setAudioStatus('GENERATING_AUDIO');
          setAudioProgress(0);
          // Start polling for status
          startStatusPolling(generatedAudioFileId);
          
          // Refresh audio files list để hiển thị audio mới
          const updatedAudioFiles = await newsService.getArticleAudioFiles(articleId);
          setAudioFiles(updatedAudioFiles);
        }
        
        setAudioMessage(
          result.message || 'Audio generation from summary started. Tracking progress...'
        );
        setAudioMessageType('success');
        
        // Don't clear message immediately if we're tracking progress
        if (!generatedAudioFileId) {
          setTimeout(() => {
            setAudioMessage(null);
            setAudioMessageType(null);
          }, 8000);
        }
      } else {
        // Handle different error cases
        let errorMsg = result.error || 'Failed to generate audio from summary';
        
        if (result.status === 404) {
          errorMsg = 'Endpoint not found. The audio generation feature may not be available yet. Please contact the administrator.';
        } else if (result.errorCode === 'TTS_CONFIG_NO_DEFAULT') {
          errorMsg = 'No default TTS configuration found. Please provide custom voice settings or configure your default TTS settings.';
        } else if (result.status === 400) {
          errorMsg = result.error || 'Invalid request. Please check your input.';
        } else if (result.status >= 500) {
          errorMsg = 'Server error occurred. Please try again later.';
        }

        setAudioMessage(errorMsg);
        setAudioMessageType('error');
        
        // Clear error message after 8 seconds
        setTimeout(() => {
          setAudioMessage(null);
          setAudioMessageType(null);
        }, 8000);
      }
    } catch (error) {
      console.error('Error generating audio from summary:', error);
      setAudioMessage('An unexpected error occurred. Please try again.');
      setAudioMessageType('error');
      
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 8000);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Poll audio generation status
  const startStatusPolling = (fileId) => {
    let isPolling = true;
    
    const pollInterval = setInterval(async () => {
      if (!isPolling) return;
      
      try {
        const statusResult = await newsService.checkAudioStatus(fileId);
        
        if (statusResult.success && statusResult.data) {
          const status = statusResult.data.status;
          const progress = statusResult.data.progressPercentage;
          
          setAudioStatus(status);
          if (progress !== null && progress !== undefined) {
            setAudioProgress(progress);
          }
          
          // Update message based on status
          if (status === 'COMPLETED') {
            setAudioMessage('Audio generation completed successfully!');
            setAudioMessageType('success');
            isPolling = false;
            clearInterval(pollInterval);
            
            // Refresh audio files list để cập nhật status
            const articleId = id || article?.id;
            if (articleId) {
              newsService.getArticleAudioFiles(articleId).then(updatedFiles => {
                setAudioFiles(updatedFiles);
              }).catch(err => {
                console.error('Error refreshing audio files list:', err);
              });
            }
            
            // Fetch audio URL when completed
            if (fileId) {
              newsService.getAudioStreamUrl(fileId).then(url => {
                if (url) {
                  setAudioUrl(url);
                }
              }).catch(err => {
                console.error('Error loading audio URL:', err);
              });
            }
            
            // Clear message after 10 seconds, but keep audioStatus and audioFileId for audio player
            setTimeout(() => {
              setAudioMessage(null);
              setAudioMessageType(null);
              // Don't clear audioStatus and audioFileId - keep them for audio player
              setAudioProgress(100);
            }, 10000);
          } else if (status === 'FAILED') {
            const errorMsg = statusResult.data.errorMessage || 'Audio generation failed';
            setAudioMessage(`Audio generation failed: ${errorMsg}`);
            setAudioMessageType('error');
            isPolling = false;
            clearInterval(pollInterval);
            // Clear message after 10 seconds
            setTimeout(() => {
              setAudioMessage(null);
              setAudioMessageType(null);
              setAudioStatus(null);
              setAudioProgress(0);
            }, 10000);
          } else if (status === 'GENERATING_AUDIO') {
            // Update progress message
            const progressMsg = progress !== null && progress !== undefined
              ? `Generating audio... ${progress.toFixed(1)}%`
              : 'Generating audio...';
            setAudioMessage(progressMsg);
            setAudioMessageType('info');
          }
        } else {
          // Error checking status, but continue polling
          console.error('Error checking audio status:', statusResult.error);
        }
      } catch (error) {
        console.error('Error polling audio status:', error);
        // Continue polling even on error
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup: stop polling after 5 minutes (safety timeout)
    setTimeout(() => {
      if (isPolling) {
        isPolling = false;
        clearInterval(pollInterval);
        setAudioMessage('Status check timeout. Please refresh the page to check status manually.');
        setAudioMessageType('warning');
      }
    }, 300000); // 5 minutes
  };

  const handleRelatedArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
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
        const progress = statusResult.data.progressPercentage;
        
        setAudioStatus(status);
        setAudioFileId(audioFileId);
        
        if (progress !== null && progress !== undefined) {
          setAudioProgress(progress);
        }
        
        if (status === 'COMPLETED') {
          // Load audio URL để stream
          const url = await newsService.getAudioStreamUrl(audioFileId);
          if (url) {
            setAudioUrl(url);
          } else {
            setAudioMessage('Failed to load audio stream.');
            setAudioMessageType('error');
            setTimeout(() => {
              setAudioMessage(null);
              setAudioMessageType(null);
            }, 5000);
          }
        } else if (status === 'GENERATING_AUDIO') {
          // Start polling
          startStatusPolling(audioFileId);
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

  const handleDownloadAudio = async () => {
    if (!selectedAudioFileId && !audioFileId) return;
    const downloadFileId = selectedAudioFileId || audioFileId;

    try {
      const blob = await newsService.downloadAudio(downloadFileId);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audio-${downloadFileId}.wav`; // Set filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      // Show success message
      setAudioMessage('Audio file downloaded successfully!');
      setAudioMessageType('success');
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 3000);
    } catch (error) {
      console.error('Error downloading audio:', error);
      let errorMsg = 'Failed to download audio file.';
      
      if (error.status === 403) {
        errorMsg = 'You do not have permission to download this audio file.';
      } else if (error.status === 404) {
        errorMsg = 'Audio file not found.';
      } else if (error.status === 400) {
        errorMsg = error.message || 'Audio file is not ready for download.';
      }
      
      setAudioMessage(errorMsg);
      setAudioMessageType('error');
      setTimeout(() => {
        setAudioMessage(null);
        setAudioMessageType(null);
      }, 5000);
    }
  };

  // Helper function to get author name from object or string
  const getAuthorName = (author) => {
    if (!author) return 'Anonymous';
    if (typeof author === 'string') return author;
    if (typeof author === 'object') {
      // Try different possible fields for author name
      return author.firstName && author.lastName 
        ? `${author.firstName} ${author.lastName}`
        : author.firstName || author.lastName || author.username || author.email || 'Anonymous';
    }
    return String(author) || 'Anonymous';
  };

  // Helper function to get author initial for avatar
  const getAuthorInitial = (author) => {
    const name = getAuthorName(author);
    return name.charAt(0).toUpperCase() || 'A';
  };

  // Helper function to get image URL
  const getImageUrl = (url) => {
    if (!url) return null;
    
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
    const cleanBaseURL = baseURL.replace(/\/api\/v1$/, '');
    
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBaseURL}${cleanUrl}`;
  };

  // Helper function to process content and ensure images display correctly
  const processContent = (content, contentImageUrls) => {
    if (!content) return content;
    
    let processedContent = content;
    
    // Replace placeholders with actual URLs if content has placeholders
    if (contentImageUrls && Array.isArray(contentImageUrls) && contentImageUrls.length > 0) {
      contentImageUrls.forEach((url, index) => {
        const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
        if (processedContent.includes(placeholder)) {
          processedContent = processedContent.replace(placeholder, url);
        }
      });
    }
    
    // Convert all relative image URLs to absolute URLs
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    processedContent = processedContent.replace(imgRegex, (match, src) => {
      // If already absolute URL (http/https/blob/data), keep as is
      if (src.startsWith('http://') || src.startsWith('https://') || 
          src.startsWith('blob:') || src.startsWith('data:')) {
        return match;
      }
      
      // Convert relative URL to absolute
      const absoluteUrl = getImageUrl(src);
      return match.replace(src, absoluteUrl);
    });
    
    return processedContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The article you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article>
          {/* Article Header */}
          <header className="mb-8">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                {article.category.name || 'News'}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>
            
            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed font-light">
                {article.excerpt}
              </p>
            )}

            {/* Summary Section */}
            {article.summary && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      Article Summary
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              {(article.authorName || article.author) && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">{getAuthorName(article.authorName || article.author)}</span>
                </div>
              )}
              {(article.publishedAt || article.createdAt) && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                </div>
              )}
              {article.viewCount !== undefined && (
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  <span>{article.viewCount || 0} views</span>
                </div>
              )}
            </div>

            {/* Article Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={handleBookmark}
                className={`flex items-center px-5 py-2.5 rounded-lg transition-all ${
                  isBookmarked 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>

              <button
                onClick={handleTTS}
                disabled={isGeneratingAudio || !article || loading}
                className={`flex items-center px-5 py-2.5 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-all shadow-md ${
                  (isGeneratingAudio || !article || loading) ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Generate Audio
                  </>
                )}
              </button>

              <button
                onClick={handleTTSSummary}
                disabled={isGeneratingAudio || !article || loading}
                className={`flex items-center px-5 py-2.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all shadow-md ${
                  (isGeneratingAudio || !article || loading) ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Generate from Summary
                  </>
                )}
              </button>
            </div>

            {/* Audio Generation Messages */}
            {audioMessage && (
              <div className="mb-6">
                <Alert
                  variant={audioMessageType === 'info' ? 'info' : audioMessageType}
                  title={
                    audioMessageType === 'success' ? 'Success' : 
                    audioMessageType === 'error' ? 'Error' :
                    audioMessageType === 'warning' ? 'Warning' :
                    'Info'
                  }
                  dismissible
                  onDismiss={() => {
                    setAudioMessage(null);
                    setAudioMessageType(null);
                    // Don't clear audioStatus and audioFileId if completed, so audio player stays visible
                    if (audioStatus !== 'GENERATING_AUDIO' && audioStatus !== 'COMPLETED') {
                      setAudioStatus(null);
                      setAudioProgress(0);
                      setAudioFileId(null);
                    }
                  }}
                >
                  <div>
                    {audioMessage}
                    {/* Progress Bar */}
                    {audioStatus === 'GENERATING_AUDIO' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${audioProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {audioProgress > 0 ? `${audioProgress.toFixed(1)}% complete` : 'Starting...'}
                        </p>
                      </div>
                    )}
                  </div>
                </Alert>
              </div>
            )}

            {/* Audio Files List - Hiển thị danh sách audio để chọn */}
            {audioFiles.length > 0 && (
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <Volume2 className="h-5 w-5 mr-2 text-orange-500" />
                    Available Audio Files ({audioFiles.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {audioFiles.map((audioFile) => (
                      <div
                        key={audioFile.id}
                        onClick={() => !loadingAudioFiles && handleSelectAndStreamAudio(audioFile.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedAudioFileId === audioFile.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${loadingAudioFiles ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                Audio #{audioFile.id}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                audioFile.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-700'
                                  : audioFile.status === 'GENERATING_AUDIO'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : audioFile.status === 'FAILED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {audioFile.status || 'UNKNOWN'}
                              </span>
                              {selectedAudioFileId === audioFile.id && audioStatus === 'COMPLETED' && (
                                <span className="text-xs text-green-600 font-medium">● Playing</span>
                              )}
                            </div>
                            {audioFile.createdAt && (
                              <p className="text-sm text-gray-500">
                                Created: {formatDate(audioFile.createdAt)}
                              </p>
                            )}
                            {audioFile.fileName && (
                              <p className="text-xs text-gray-400 mt-1">
                                File: {audioFile.fileName}
                              </p>
                            )}
                            {audioFile.errorMessage && (
                              <p className="text-xs text-red-600 mt-1">
                                Error: {audioFile.errorMessage}
                              </p>
                            )}
                          </div>
                          {selectedAudioFileId === audioFile.id && (
                            <div className="ml-3">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Audio Player - Always visible when completed */}
            {audioStatus === 'COMPLETED' && selectedAudioFileId && audioUrl && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-gray-900 flex items-center">
                      <Volume2 className="h-5 w-5 mr-2 text-orange-500" />
                      Generated Audio Ready
                    </h4>
                    <button
                      onClick={handleDownloadAudio}
                      className="flex items-center px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors text-sm"
                      title="Download audio file"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Download
                    </button>
                  </div>
                  {audioUrl ? (
                    <audio
                      controls
                      className="w-full"
                      src={audioUrl}
                      preload="metadata"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <div className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-500" />
                      <p className="text-sm text-gray-600 mt-2">Loading audio...</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-3">
                    Audio file has been generated successfully. Click play to listen to the article audio.
                  </p>
                </div>
              </div>
            )}
          </header>

          {/* Featured Image */}
          {(article.featuredImage || article.imageUrl) && (
            <div className="mb-8">
              <img 
                src={getImageUrl(article.featuredImage || article.imageUrl)}
                alt={article.title}
                className="w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline max-w-none mb-12">
            {article.content ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(
                    processContent(article.content, article.contentImageUrls), 
                    {
                      ADD_TAGS: ['iframe'],
                      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
                    }
                  ) 
                }} 
              />
            ) : (
              <div className="text-gray-600 leading-relaxed">
                <p className="mb-4">
                  This is a sample article content. In a real application, this would be the actual article content 
                  fetched from the backend API. The content would include paragraphs, images, videos, and other 
                  rich media elements.
                </p>
                <p className="mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
                  ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="mb-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
                  pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
                  mollit anim id est laborum.
                </p>
              </div>
            )}
          </div>

          {/* Author Info Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-12 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About the Author</h3>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {getAuthorInitial(article.authorName || article.author)}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg mb-1">
                  {getAuthorName(article.authorName || article.author)}
                </h4>
                <p className="text-sm text-gray-500 mb-2">Author</p>
                <p className="text-gray-600 text-sm">
                  Experienced journalist with a passion for delivering accurate and engaging news content.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <CommentSection articleId={parseInt(id)} />

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle, index) => (
                <ArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                  layout="vertical"
                  index={index}
                  onClick={handleRelatedArticleClick}
                  className="shadow-md hover:shadow-lg transition-shadow"
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Audio Generation Modal */}
      <Modal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        title="Generate Audio from Article"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowAudioModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateAudio}
              disabled={isGeneratingAudio}
              className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center"
            >
              {isGeneratingAudio ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Audio'
              )}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Option Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Voice Configuration
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="voiceConfig"
                  checked={useDefaultConfig}
                  onChange={() => setUseDefaultConfig(true)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Use Default TTS Configuration</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Use your saved default TTS settings
                  </div>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="voiceConfig"
                  checked={!useDefaultConfig}
                  onChange={() => setUseDefaultConfig(false)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Custom Voice Settings</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Configure voice settings for this audio generation
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Custom Voice Settings Form */}
          {!useDefaultConfig && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Voice Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Language Code"
                  type="text"
                  value={customVoiceSettings.languageCode}
                  onChange={(e) => setCustomVoiceSettings({
                    ...customVoiceSettings,
                    languageCode: e.target.value
                  })}
                  placeholder="en-US"
                  required
                  helperText="Format: xx-XX (e.g., en-US, vi-VN)"
                />
                
                <Input
                  label="Voice Name"
                  type="text"
                  value={customVoiceSettings.voiceName}
                  onChange={(e) => setCustomVoiceSettings({
                    ...customVoiceSettings,
                    voiceName: e.target.value
                  })}
                  placeholder="en-US-Standard-B"
                  required
                  helperText="Google TTS voice name (max 50 characters)"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaking Rate: <span className="font-semibold text-orange-600">{customVoiceSettings.speakingRate}</span>
                  </label>
                  <input
                    type="range"
                    min="0.25"
                    max="4.0"
                    step="0.1"
                    value={customVoiceSettings.speakingRate}
                    onChange={(e) => setCustomVoiceSettings({
                      ...customVoiceSettings,
                      speakingRate: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.25</span>
                    <span>4.0</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Range: 0.25 - 4.0</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch: <span className="font-semibold text-orange-600">{customVoiceSettings.pitch}</span>
                  </label>
                  <input
                    type="range"
                    min="-20.0"
                    max="20.0"
                    step="0.1"
                    value={customVoiceSettings.pitch}
                    onChange={(e) => setCustomVoiceSettings({
                      ...customVoiceSettings,
                      pitch: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-20.0</span>
                    <span>0</span>
                    <span>20.0</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Range: -20.0 to 20.0</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume Gain (dB): <span className="font-semibold text-orange-600">{customVoiceSettings.volumeGain}</span>
                  </label>
                  <input
                    type="range"
                    min="-96.0"
                    max="16.0"
                    step="0.1"
                    value={customVoiceSettings.volumeGain}
                    onChange={(e) => setCustomVoiceSettings({
                      ...customVoiceSettings,
                      volumeGain: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-96.0</span>
                    <span>0</span>
                    <span>16.0</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Range: -96.0 to 16.0 dB</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio Encoding
                  </label>
                  <select
                    value={customVoiceSettings.audioEncoding}
                    onChange={(e) => setCustomVoiceSettings({
                      ...customVoiceSettings,
                      audioEncoding: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="MP3">MP3</option>
                    <option value="LINEAR16">LINEAR16</option>
                    <option value="OGG_OPUS">OGG_OPUS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Rate (Hz) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customVoiceSettings.sampleRateHertz}
                    onChange={(e) => setCustomVoiceSettings({
                      ...customVoiceSettings,
                      sampleRateHertz: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="RATE_8000">8000 Hz</option>
                    <option value="RATE_16000">16000 Hz</option>
                    <option value="RATE_22050">22050 Hz</option>
                    <option value="RATE_24000">24000 Hz</option>
                    <option value="RATE_44100">44100 Hz</option>
                    <option value="RATE_48000">48000 Hz</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Select the audio sample rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="mr-2"
                  disabled
                />
                <span className="text-sm text-gray-700">Enable Summarization (Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="mr-2"
                  disabled
                />
                <span className="text-sm text-gray-700">Enable Translation</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* Generate Audio from Summary Modal */}
      <Modal
        isOpen={showSummaryAudioModal}
        onClose={() => setShowSummaryAudioModal(false)}
        title="Generate Audio from Summary"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowSummaryAudioModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateAudioFromSummary}
              disabled={isGeneratingAudio}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center"
            >
              {isGeneratingAudio ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Audio'
              )}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This feature generates audio from the article summary. It is available to all users and does not require author permissions.
            </p>
          </div>

          {/* Option Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Voice Configuration
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="voiceConfigSummary"
                  checked={useDefaultConfigForSummary}
                  onChange={() => setUseDefaultConfigForSummary(true)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Use Default TTS Configuration</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Use your saved default TTS settings
                  </div>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="voiceConfigSummary"
                  checked={!useDefaultConfigForSummary}
                  onChange={() => setUseDefaultConfigForSummary(false)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Custom Voice Settings</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Configure voice settings for this audio generation
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Custom Voice Settings Form */}
          {!useDefaultConfigForSummary && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Voice Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Language Code"
                  type="text"
                  value={customVoiceSettingsForSummary.languageCode}
                  onChange={(e) => setCustomVoiceSettingsForSummary({
                    ...customVoiceSettingsForSummary,
                    languageCode: e.target.value
                  })}
                  placeholder="en-US"
                  required
                  helperText="Format: xx-XX (e.g., en-US, vi-VN)"
                />
                
                <Input
                  label="Voice Name"
                  type="text"
                  value={customVoiceSettingsForSummary.voiceName}
                  onChange={(e) => setCustomVoiceSettingsForSummary({
                    ...customVoiceSettingsForSummary,
                    voiceName: e.target.value
                  })}
                  placeholder="en-US-Standard-B"
                  required
                  helperText="Google TTS voice name (max 50 characters)"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaking Rate: <span className="font-semibold text-blue-600">{customVoiceSettingsForSummary.speakingRate}</span>
                  </label>
                  <input
                    type="range"
                    min="0.25"
                    max="4.0"
                    step="0.1"
                    value={customVoiceSettingsForSummary.speakingRate}
                    onChange={(e) => setCustomVoiceSettingsForSummary({
                      ...customVoiceSettingsForSummary,
                      speakingRate: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.25</span>
                    <span>4.0</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Range: 0.25 - 4.0</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch: <span className="font-semibold text-blue-600">{customVoiceSettingsForSummary.pitch}</span>
                  </label>
                  <input
                    type="range"
                    min="-20.0"
                    max="20.0"
                    step="0.1"
                    value={customVoiceSettingsForSummary.pitch}
                    onChange={(e) => setCustomVoiceSettingsForSummary({
                      ...customVoiceSettingsForSummary,
                      pitch: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-20.0</span>
                    <span>0</span>
                    <span>20.0</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Range: -20.0 to 20.0</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume Gain (dB): <span className="font-semibold text-blue-600">{customVoiceSettingsForSummary.volumeGain}</span>
                  </label>
                  <input
                    type="range"
                    min="-96.0"
                    max="16.0"
                    step="0.1"
                    value={customVoiceSettingsForSummary.volumeGain}
                    onChange={(e) => setCustomVoiceSettingsForSummary({
                      ...customVoiceSettingsForSummary,
                      volumeGain: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-96.0</span>
                    <span>0</span>
                    <span>16.0</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Range: -96.0 to 16.0 dB</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio Encoding
                  </label>
                  <select
                    value={customVoiceSettingsForSummary.audioEncoding}
                    onChange={(e) => setCustomVoiceSettingsForSummary({
                      ...customVoiceSettingsForSummary,
                      audioEncoding: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MP3">MP3</option>
                    <option value="LINEAR16">LINEAR16</option>
                    <option value="OGG_OPUS">OGG_OPUS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Rate (Hz) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customVoiceSettingsForSummary.sampleRateHertz}
                    onChange={(e) => setCustomVoiceSettingsForSummary({
                      ...customVoiceSettingsForSummary,
                      sampleRateHertz: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="RATE_8000">8000 Hz</option>
                    <option value="RATE_16000">16000 Hz</option>
                    <option value="RATE_22050">22050 Hz</option>
                    <option value="RATE_24000">24000 Hz</option>
                    <option value="RATE_44100">44100 Hz</option>
                    <option value="RATE_48000">48000 Hz</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Select the audio sample rate</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ArticleDetailPage;
