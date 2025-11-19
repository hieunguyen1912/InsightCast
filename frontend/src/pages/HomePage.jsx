import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import newsService from '../features/article/api';
import categoryService from '../features/category/api';
import { ArticleCard } from '../components/cards';
import { SearchBar } from '../components/forms';

function HomePage() {
  const navigate = useNavigate();
  
  // State for dynamic data
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({}); // { categoryId: [articles] }
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch featured, trending, and latest articles
        const [featured, trending, latest, categoriesResult] = await Promise.all([
          newsService.getFeaturedArticle(),
          newsService.getTrendingArticles(3),
          newsService.getLatestArticles(4),
          categoryService.getRootCategories()
        ]);
        
        setFeaturedArticle(featured);
        setTrendingArticles(trending);
        setLatestArticles(latest);
        
        // Process categories
        if (categoriesResult.success) {
          const categoriesList = Array.isArray(categoriesResult.data) 
            ? categoriesResult.data 
            : (categoriesResult.data?.content || []);
          
          // Filter only active categories and limit to 6 for homepage
          const activeCategories = categoriesList
            .filter(cat => cat.isActive !== false)
            .slice(0, 6);
          
          setCategories(activeCategories);
          
          // Set first category as selected by default
          if (activeCategories.length > 0) {
            setSelectedCategoryId(activeCategories[0].id);
          }
          
          // Fetch articles for each category
          const articlesPromises = activeCategories.map(async (category) => {
            try {
              const articles = await newsService.getArticlesByCategory(category.id, 4);
              return { categoryId: category.id, articles };
            } catch (err) {
              console.error(`Error fetching articles for category ${category.id}:`, err);
              return { categoryId: category.id, articles: [] };
            }
          });
          
          const articlesResults = await Promise.all(articlesPromises);
          const articlesMap = {};
          articlesResults.forEach(({ categoryId, articles }) => {
            articlesMap[categoryId] = articles;
          });
          setCategoryArticles(articlesMap);
        }
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

              {/* Browse by Category Section */}
              {categories.length > 0 && (
                <section className="py-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
                    </div>
                    
                    {/* Category Navigation Tabs */}
                    <div className="border-t border-gray-200 pt-4 mb-8">
                      <div className="flex flex-wrap gap-6">
                        {categories.map((category) => {
                          const isSelected = selectedCategoryId === category.id;
                          return (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategoryId(category.id)}
                              className={`relative pb-2 transition-colors ${
                                isSelected
                                  ? 'text-gray-900 font-bold'
                                  : 'text-gray-600 font-normal hover:text-gray-900'
                              }`}
                            >
                              {category.name}
                              {isSelected && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Articles for Selected Category */}
                    {selectedCategoryId && categoryArticles[selectedCategoryId] && categoryArticles[selectedCategoryId].length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categoryArticles[selectedCategoryId].map((article, index) => (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            layout="vertical"
                            index={index}
                            onClick={handleArticleClick}
                          />
                        ))}
                      </div>
                    )}
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