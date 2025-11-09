import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Volume2, 
  Share2, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import newsService from '../features/article/api';
import categoryService from '../features/category/api';
import { ArticleCard } from '../components/cards';
import { SearchBar } from '../components/forms';
import { audioPlayers, videoNews } from '../data/mockHomePageData';

function HomePage() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(0);
  
  // State for dynamic data
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [categoriesWithArticles, setCategoriesWithArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [featured, trending, latest, cats] = await Promise.all([
          newsService.getFeaturedArticle(),
          newsService.getTrendingArticles(3),
          newsService.getLatestArticles(4),
          newsService.getCategories().catch(() => []) // Fetch categories, fallback to empty array
        ]);
        
        
        setFeaturedArticle(featured);
        setTrendingArticles(trending);
        setLatestArticles(latest);
        setCategories(cats);
        
        // Fetch articles for multiple categories
        // Get root categories (categories without parent) or top active categories
        const rootCategories = cats.filter(cat => 
          (cat.parentId === null || cat.parentId === undefined) && 
          cat.isActive !== false
        );
        
        // If no root categories, use top 5 active categories
        const categoriesToFetch = rootCategories.length > 0
          ? rootCategories.slice(0, 5) // Limit to top 5 root categories
          : cats.slice(0, 5).filter(cat => cat.isActive !== false);
        
        // Fetch articles for each category in parallel
        const categoryArticlesPromises = categoriesToFetch.map(async (category) => {
          const result = await categoryService.getArticlesByCategory(
            category.id,
            {
              page: 0,
              size: 4,
              sortBy: 'publishedAt',
              sortDirection: 'desc'
            }
          );
          
          return {
            category: category,
            articles: result.success && result.data?.content ? result.data.content : [],
            error: result.success ? null : result.error
          };
        });
        
        const categoriesWithArticlesData = await Promise.all(categoryArticlesPromises);
        // Filter out categories with no articles
        const filteredCategories = categoriesWithArticlesData.filter(
          item => item.articles.length > 0
        );
        setCategoriesWithArticles(filteredCategories);
      } catch (err) {
        console.error('Error fetching news data:', err);
        setError('Failed to load news data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search and pagination state
  const [searchFilters, setSearchFilters] = useState({});
  const [searchPagination, setSearchPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  const handleSearch = async (filters, page = 0) => {
    try {
      setIsSearching(true);
      setError(null);
      
      // Store filters for pagination
      setSearchFilters(filters);
      
      // Convert dates to ISO format if provided
      const formattedFilters = {
        ...filters,
        fromDate: filters.fromDate ? new Date(filters.fromDate).toISOString() : null,
        toDate: filters.toDate ? new Date(filters.toDate).toISOString() : null
      };

      const response = await newsService.searchArticles(formattedFilters, page, 20);
      
      // Handle PaginatedResponse structure
      if (response && response.content) {
        setSearchResults(response.content);
        setSearchPagination({
          page: response.page || 0,
          size: response.size || 20,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          hasNext: response.hasNext || false,
          hasPrevious: response.hasPrevious || false
        });
      } else {
        // Fallback: assume response is array for backward compatibility
        setSearchResults(Array.isArray(response) ? response : []);
      }
      setIsSearchMode(true);
    } catch (err) {
      console.error('Error searching articles:', err);
      setError('Failed to search articles');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage) => {
    handleSearch(searchFilters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setIsSearchMode(false);
    setSearchResults([]);
  };

  const handleTTS = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement TTS functionality
  };

  const handleArticleClick = async (articleId) => {
    // Navigate immediately for better UX
    navigate(`/article/${articleId}`);
    
    // Track view in background (non-blocking)
    newsService.trackArticleView(articleId).catch(err => {
      console.error('Error tracking article view:', err);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
            </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Search Bar Section */}
          <section className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SearchBar 
                onSearch={handleSearch}
                categories={categories}
              />
            </div>
          </section>

          {/* Search Results */}
          {isSearchMode && (
            <section className="py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Search Results
                    {searchPagination.totalElements > 0 && (
                      <span className="text-lg font-normal text-gray-500 ml-2">
                        ({searchPagination.totalElements} {searchPagination.totalElements === 1 ? 'article' : 'articles'})
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={handleBackToHome}
                    className="text-black hover:text-gray-600 transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Back to Home
                  </button>
                </div>

                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No articles found matching your search criteria.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {searchResults.map((article, index) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          layout="vertical"
                          index={index}
                          onClick={handleArticleClick}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {searchPagination.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                          onClick={() => handlePageChange(searchPagination.page - 1)}
                          disabled={!searchPagination.hasPrevious || isSearching}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <span className="px-4 py-2 text-gray-700">
                            Page {searchPagination.page + 1} of {searchPagination.totalPages}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(searchPagination.page + 1)}
                          disabled={!searchPagination.hasNext || isSearching}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Hero Section */}
          {!isSearchMode && (
            <>
              <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Article */}
                    <div className="lg:col-span-2 h-full">
                      {featuredArticle && (
                        <div className="h-[432px]">
                          <ArticleCard
                            article={featuredArticle}
                            layout="featured"
                            onClick={handleArticleClick}
                          />
                        </div>
                      )}
                    </div>

                    {/* Side Articles */}
                    <div className="space-y-6">
                      {trendingArticles.map((article, index) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          layout="horizontal"
                          index={index}
                          onClick={handleArticleClick}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Latest Articles Section */}
              <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
                    <a href="#" className="flex items-center text-orange-500 hover:text-orange-600 font-medium">
                      Show More
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {latestArticles.map((article, index) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        layout="vertical"
                        index={index}
                        onClick={handleArticleClick}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* News in Video Section */}
              <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">News in Video</h2>
                    <a href="#" className="flex items-center text-orange-500 hover:text-orange-600 font-medium">
                      Show More
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Video List */}
                    <div className="lg:col-span-2 space-y-4">
                      {videoNews.map((video, index) => (
                        <div
                          key={video.id}
                          className="flex bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="relative w-32 h-24 flex-shrink-0">
                            <img 
                              src={video.image}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white bg-opacity-90 rounded-full p-2">
                                <Play className="h-6 w-6 text-orange-500" />
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                              {video.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {video.description}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="text-orange-500 font-medium mr-2">{video.category}</span>
                              <span>{video.watchTime}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Featured Video */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                        <div className="relative">
                          <img 
                            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
                            alt="Saeid Esmaeili Loivasi wins gold"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white bg-opacity-90 rounded-full p-4">
                              <Play className="h-8 w-8 text-orange-500" />
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Saeid Esmaeili Loivasi wins gold
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Watch the incredible moment as Saeid Esmaeili Loivasi secures the gold medal in a stunning performance that captivated audiences worldwide.
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="text-orange-500 font-medium mr-2">Olympics</span>
                            <span>5 min watch</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Listen to Person of the Week Section */}
              <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Listen to Person of the week</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Stay informed and inspired. Listen to our featured Person of the Week interview.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-center">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      
                      <div className="mx-8 bg-white rounded-2xl shadow-xl p-8 max-w-md">
                        <div className="text-center mb-6">
                          <img 
                            src={audioPlayers[currentAudio].image}
                            alt={audioPlayers[currentAudio].title}
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                          />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {audioPlayers[currentAudio].title}
                          </h3>
                          <p className="text-gray-600">{audioPlayers[currentAudio].subtitle}</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 transition-colors"
                            >
                              {isPlaying ? (
                                <Volume2 className="h-6 w-6" />
                              ) : (
                                <Play className="h-6 w-6" />
                              )}
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(parseInt(audioPlayers[currentAudio].currentTime.split(':')[0]) * 60 + parseInt(audioPlayers[currentAudio].currentTime.split(':')[1])) / (parseInt(audioPlayers[currentAudio].duration.split(':')[0]) * 60 + parseInt(audioPlayers[currentAudio].duration.split(':')[1])) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{audioPlayers[currentAudio].currentTime}</span>
                              <span>{audioPlayers[currentAudio].duration}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center space-x-4">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Volume2 className="h-5 w-5" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Share2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </div>
                  
                    {/* Pagination Dots */}
                    <div className="flex justify-center mt-6 space-x-2">
                      {audioPlayers.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAudio(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentAudio ? 'bg-orange-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Categories with Articles Section */}
              {categoriesWithArticles.length > 0 && (
                <section className="py-12 bg-gray-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Articles by Category</h2>
                    
                    <div className="space-y-12">
                      {categoriesWithArticles.map((categoryData) => (
                        <div key={categoryData.category.id} className="bg-white rounded-lg p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {categoryData.category.name}
                            </h3>
                            <a 
                              href={`/category/${categoryData.category.id}`} 
                              className="flex items-center text-orange-500 hover:text-orange-600 font-medium"
                            >
                              Show More
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </a>
                          </div>
                          
                          {categoryData.category.description && (
                            <p className="text-gray-600 mb-6">{categoryData.category.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categoryData.articles.map((article, index) => (
                              <ArticleCard
                                key={article.id}
                                article={article}
                                layout="vertical"
                                index={index}
                                onClick={handleArticleClick}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;