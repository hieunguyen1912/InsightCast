import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  Share2, 
  Bookmark,
  Volume2,
  Loader2,
  Download
} from 'lucide-react';
import newsService from '../api';
import { formatNewsTime, formatDate } from '../../../utils/formatTime';
import { ArticleCard } from '../../../components/cards';
import Alert from '../../../components/common/Alert';
import Modal from '../../../components/common/Modal';
import { Input } from '../../../components/common';

function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState(null);
  const [audioMessageType, setAudioMessageType] = useState(null); // 'success' | 'error'
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [useDefaultConfig, setUseDefaultConfig] = useState(true);
  const [audioFileId, setAudioFileId] = useState(null);
  const [audioStatus, setAudioStatus] = useState(null); // 'GENERATING_AUDIO' | 'COMPLETED' | 'FAILED'
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [customVoiceSettings, setCustomVoiceSettings] = useState({
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

  const handleLike = async () => {
    try {
      await newsService.toggleArticleLike(article.id, !isLiked);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality
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
          setAudioStatus('GENERATING_AUDIO');
          setAudioProgress(0);
          // Start polling for status
          startStatusPolling(generatedAudioFileId);
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

  const handleDownloadAudio = async () => {
    if (!audioFileId) return;

    try {
      const blob = await newsService.downloadAudio(audioFileId);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audio-${audioFileId}.wav`; // Set filename
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
                onClick={handleLike}
                className={`flex items-center px-5 py-2.5 rounded-lg transition-all ${
                  isLiked 
                    ? 'bg-red-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </button>
              
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

            {/* Audio Player - Always visible when completed */}
            {audioStatus === 'COMPLETED' && audioFileId && (
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
                  __html: DOMPurify.sanitize(article.content, {
                    ADD_TAGS: ['iframe'],
                    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
                  }) 
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
    </div>
  );
}

export default ArticleDetailPage;
