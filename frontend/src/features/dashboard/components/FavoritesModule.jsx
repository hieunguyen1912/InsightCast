/**
 * Favorites module component
 * Displays user's favorite articles
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import newsService from '../../article/api';
import { ArticleCard } from '../../../components/cards';
import { Bookmark, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

function FavoritesModule() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    first: true,
    last: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      const result = await newsService.getArticleFavorites(page, size, 'updatedAt', 'desc');
      
      setFavorites(result.content || []);
      setPagination({
        page: result.page || 0,
        size: result.size || 10,
        totalElements: result.totalElements || 0,
        totalPages: result.totalPages || 0,
        hasNext: result.hasNext || false,
        hasPrevious: result.hasPrevious || false,
        first: result.first !== undefined ? result.first : true,
        last: result.last !== undefined ? result.last : true
      });
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      loadFavorites(newPage, pagination.size);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRemoveFavorite = async (favoriteId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking remove button
    
    if (!window.confirm('Are you sure you want to remove this article from favorites?')) {
      return;
    }

    try {
      setRemovingId(favoriteId);
      const result = await newsService.removeArticleFromFavorites(favoriteId);
      
      if (result.success) {
        // Remove from local state
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
        // Update pagination total
        setPagination(prev => ({
          ...prev,
          totalElements: Math.max(0, prev.totalElements - 1)
        }));
        // Reload current page if it becomes empty and not first page
        if (favorites.length === 1 && pagination.page > 0) {
          loadFavorites(pagination.page - 1, pagination.size);
        }
      } else {
        alert(result.error || 'Failed to remove from favorites');
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  // Convert favorite data to article format for ArticleCard
  const convertFavoriteToArticle = (favorite) => {
    return {
      id: favorite.articleId,
      title: favorite.articleTitle,
      excerpt: favorite.articleDescription,
      featuredImage: favorite.articleImageUrl,
      createdAt: favorite.createdAt,
      // Add other fields that ArticleCard might need
      viewCount: 0,
      categoryName: 'Favorite'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadFavorites}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!loading && favorites.length === 0 && pagination.totalElements === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h3>
        <p className="text-gray-500 mb-4">Start saving articles you love!</p>
        <button
          onClick={() => navigate('/')}
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Browse Articles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            {pagination.totalElements} {pagination.totalElements === 1 ? 'Favorite' : 'Favorites'}
          </h2>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => {
          const article = convertFavoriteToArticle(favorite);
          const isRemoving = removingId === favorite.id;
          
          return (
            <div key={favorite.id} className="relative group">
              <ArticleCard
                article={article}
                layout="vertical"
                onClick={() => handleArticleClick(article.id)}
                className="h-full"
              />
              
              {/* Remove button overlay */}
              <button
                onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                disabled={isRemoving}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Remove from favorites"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page + 1} of {pagination.totalPages} ({pagination.totalElements} total)
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1 || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default FavoritesModule;

