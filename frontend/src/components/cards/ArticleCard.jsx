import React, { useState, useEffect, useRef } from 'react';
import { formatNewsTime } from '../../utils/formatTime';

/**
 * Reusable Article Card Component
 * @param {Object} props
 * @param {Object} props.article - Article data
 * @param {string} props.layout - 'horizontal' | 'vertical' | 'featured'
 * @param {number} props.index - Index for animation delay
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
function ArticleCard({ 
  article, 
  layout = 'vertical', 
  index = 0, 
  onClick, 
  className = '' 
}) {
  if (!article) return null;

  // State to track image load errors
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imgRef = useRef(null);
  const timeoutRef = useRef(null);

  // Reset image state when article changes
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setImageError(false);
    setImageLoading(true);
    
    // Fallback timeout: hide loading after 3 seconds even if events don't fire
    timeoutRef.current = setTimeout(() => {
      setImageLoading(false);
    }, 3000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [article.id, article.featuredImage]);

  // Check if image is already loaded from cache after render
  useEffect(() => {
    // Use a small delay to ensure img element exists
    const checkImageLoaded = setTimeout(() => {
      if (imgRef.current) {
        if (imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setImageLoading(false);
        }
      }
    }, 100);

    return () => clearTimeout(checkImageLoaded);
  }, [article.id, article.featuredImage]);

  // Default fallback image
  const getFallbackImage = () => {
    const defaultImages = {
      horizontal: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=150&fit=crop",
      featured: "https://images.unsplash.com/photo-1476242906366-d8eb5c1a4d1a?w=800&h=600&fit=crop",
      vertical: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop"
    };
    return defaultImages[layout] || defaultImages.vertical;
  };

  // Helper function to convert relative image URLs to absolute URLs
  const processImageUrl = (url) => {
    if (!url) return null;
    
    // If already absolute URL (http/https/blob), return as is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    
    // If relative URL, prepend base URL
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
    // Remove /api/v1 if present in baseURL since relative URLs might already include it
    const cleanBaseURL = baseURL.replace(/\/api\/v1$/, '');
    
    // Ensure URL starts with /
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBaseURL}${cleanUrl}`;
  };

  // Get image URL or fallback
  // Priority: featuredImage > imageUrl (for backward compatibility)
  const getImageUrl = () => {
    const imageUrl = article.featuredImage || article.imageUrl;
    const processedUrl = processImageUrl(imageUrl);
    
    return processedUrl || getFallbackImage();
  };

  // Handle image load error
  const handleImageError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setImageError(true);
    setImageLoading(false);
  };

  // Handle image load success
  const handleImageLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setImageLoading(false);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(article.id);
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex h-32';
      case 'featured':
        return 'h-full flex flex-col';
      default:
        return '';
    }
  };

  const getImageClasses = () => {
    switch (layout) {
      case 'featured':
        // Use full height to match parent container (which matches 3 horizontal cards)
        return 'w-full h-full object-cover';
      case 'horizontal':
        return 'w-full h-full object-cover'; // Container handles sizing
      default:
        return 'w-full h-56 object-cover';
    }
  };

  const getContentClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex-1 p-5 flex flex-col justify-between';
      case 'featured':
        return 'p-6';
      default:
        return 'p-5';
    }
  };

  const getTitleClasses = () => {
    switch (layout) {
      case 'featured':
        return 'text-3xl font-bold text-gray-900 mb-4 leading-tight';
      case 'horizontal':
        return 'text-lg font-bold text-gray-900 mb-2 line-clamp-2';
      default:
        return 'text-xl font-bold text-gray-900 mb-2 line-clamp-2';
    }
  };

  const renderAuthor = () => {
    // Only show author for non-featured layouts
    if (layout === 'featured') {
      return null;
    }

    // Helper function to extract author name from various formats
    // Supports both authorName (string) and author (object or string)
    const getAuthorName = () => {
      // Handle authorName (string) from NewsArticleSummaryResponse
      if (article.authorName) {
        return article.authorName;
      }
      // Handle author as string
      if (typeof article.author === 'string') {
        return article.author;
      }
      // Handle author as object from NewsArticleResponse
      if (article.author && typeof article.author === 'object') {
        if (article.author.firstName && article.author.lastName) {
          return `${article.author.firstName} ${article.author.lastName}`;
        }
        return article.author.username || 
               article.author.firstName || 
               article.author.lastName || 
               article.author.email ||
               'Anonymous';
      }
      return 'Anonymous';
    };

    const authorName = getAuthorName();

    return (
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span>{authorName}</span>
        <span className="mx-2">•</span>
        <span>{formatNewsTime(article.publishedAt)}</span>
      </div>
    );
  };

  const getCategoryName = () => {
    // Priority: categoryName (from backend) > category.name (for backward compatibility)
    return article.categoryName || article.category?.name || 'News';
  };

  const renderMeta = () => {
    const categoryName = getCategoryName();
    
    if (layout === 'featured') {
      return null; // Meta is displayed as overlay on image for featured layout
    }

    return (
      <div className="flex items-center text-sm text-gray-500 mt-2">
        <span className="text-orange-500 font-medium mr-2">{categoryName}</span>
        <span>{article.viewCount || 0} views</span>
      </div>
    );
  };

  return (
    <article
      className={`article-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${getLayoutClasses()} ${className}`}
      onClick={handleClick}
    >
      {layout === 'horizontal' ? (
        // Horizontal layout for sidebar trending news
        <>
          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-100 rounded-l-lg">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse z-10">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              ref={imgRef}
              src={getImageUrl()}
              alt={article.title || 'Article image'}
              className={`absolute inset-0 w-full h-full object-cover object-center ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          </div>
          <div className={getContentClasses()}>
            <div>
              <h3 className={getTitleClasses()}>
                {article.title}
              </h3>
              {article.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {article.description}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
              <span className="text-orange-500 font-medium">{getCategoryName()}</span>
              <div className="flex items-center gap-2">
                <span>{article.viewCount || 0} views</span>
                <span className="mx-1">•</span>
                <span>{formatNewsTime(article.publishedAt)}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Vertical and featured layouts
        <>
          <div className={`relative overflow-hidden bg-gray-100 ${layout === 'featured' ? 'flex-1' : 'h-56'}`}>
            {imageLoading && !imageError && (
              <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse z-10`}>
                <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              ref={imgRef}
              src={getImageUrl()}
              alt={article.title || 'Article image'}
              className={`absolute inset-0 w-full h-full object-cover object-center ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            
            {/* Overlay for featured layout */}
            {layout === 'featured' && (
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <span className="bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
                  {getCategoryName()}
                </span>
                <span className="text-white text-sm font-medium drop-shadow-lg">
                  {article.viewCount || 0} views
                </span>
              </div>
            )}
          </div>
          
          <div className={getContentClasses()}>
            {renderAuthor()}
            <h3 className={getTitleClasses()}>
              {article.title}
            </h3>
            {renderMeta()}
          </div>
        </>
      )}
      </article>
  );
}

export default React.memo(ArticleCard);
