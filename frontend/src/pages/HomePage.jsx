import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Volume2, 
  Share2, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import newsService from '../services/newsService';
import { formatRelativeTime, formatNewsTime } from '../utils/formatTime';

function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(0);
  
  // State for dynamic data
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [basketballNews, setBasketballNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [featured, trending, latest] = await Promise.all([
          newsService.getFeaturedArticle(),
          newsService.getTrendingArticles(3),
          newsService.getLatestArticles(4)
        ]);
        
        setFeaturedArticle(featured);
        setTrendingArticles(trending);
        setLatestArticles(latest);
        
        // For basketball news, we'll filter from latest articles for now
        // In real implementation, you might have a specific endpoint
        const basketball = latest.filter(article => 
          article.categoryName?.toLowerCase().includes('basketball') ||
          article.title?.toLowerCase().includes('basketball')
        );
        setBasketballNews(basketball);
        
    setIsLoaded(true);
      } catch (err) {
        console.error('Error fetching news data:', err);
        setError('Failed to load news data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTTS = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement TTS functionality
  };

  // Helper functions

  const formatReadTime = (content) => {
    // Simple calculation: ~200 words per minute
    const wordCount = content ? content.split(' ').length : 0;
    const readTime = Math.ceil(wordCount / 200);
    return `${readTime} min read`;
  };

  const handleArticleClick = async (articleId) => {
    try {
      await newsService.trackArticleView(articleId);
    } catch (error) {
      console.error('Error tracking article view:', error);
    }
  };

  const audioPlayers = [
    {
      id: 1,
      title: "Person of The Week",
      subtitle: "Mairo Caine • Beyond Beautiful",
      duration: "30:00",
      currentTime: "1:52",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      title: "Weekly Sports Roundup",
      subtitle: "Sarah Johnson • Sports Weekly",
      duration: "25:00",
      currentTime: "0:00",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const videoNews = [
    {
      id: 1,
      title: "3x3 Basketball Shine Shine Champions Park Highlights in video",
      description: "Watch the best moments from the 3x3 basketball competition",
      category: "Olympics",
      watchTime: "3 min watch",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=200&fit=crop"
    },
    {
      id: 2,
      title: "How to watch women's football bronze match Spain vs. Germany",
      description: "Complete guide to watching the bronze medal match",
      category: "Olympics",
      watchTime: "2 min watch",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Dispatches Nigerian Olympic women's basketball quarterfinal",
      description: "Behind the scenes coverage of Nigeria's quarterfinal match",
      category: "Olympics",
      watchTime: "4 min watch",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop"
    }
  ];

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
      
      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Article */}
            <div className="lg:col-span-2">
              {featuredArticle && (
                <motion.div 
                  className="bg-white rounded-lg overflow-hidden shadow-lg cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => handleArticleClick(featuredArticle.id)}
                >
                  <div className="relative">
                    <img 
                      src={featuredArticle.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop"}
                      alt={featuredArticle.title}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {featuredArticle.categoryName || 'News'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-sm">
                          {featuredArticle.author?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{featuredArticle.author || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">Author</p>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {featuredArticle.title}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="text-orange-500 font-medium mr-4">{featuredArticle.categoryName || 'News'}</span>
                      <span>{formatNewsTime(featuredArticle.publishedAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{featuredArticle.viewCount || 0} views</span>
                </div>
                </div>
                </motion.div>
              )}
            </div>

            {/* Side Articles */}
            <div className="space-y-6">
              {trendingArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="flex">
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="text-orange-500 font-medium mr-2">{article.categoryName || 'News'}</span>
                        <span>{formatNewsTime(article.publishedAt)}</span>
                      </div>
                    </div>
                    <img 
                      src={article.imageUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=150&fit=crop"}
                      alt={article.title}
                      className="w-24 h-24 object-cover"
                    />
                  </div>
                </motion.div>
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
              <motion.article
                key={article.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => handleArticleClick(article.id)}
              >
                <img 
                  src={article.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop"}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{article.author || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{formatNewsTime(article.publishedAt)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="text-orange-500 font-medium mr-2">{article.categoryName || 'News'}</span>
                    <span>{article.viewCount || 0} views</span>
                  </div>
                </div>
              </motion.article>
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
                <motion.div
                  key={video.id}
                  className="flex bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
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
                </motion.div>
                  ))}
                </div>

            {/* Featured Video */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white rounded-lg overflow-hidden shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
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
              </motion.div>
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

      {/* Basketball News Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Basketball News</h2>
            <a href="#" className="flex items-center text-orange-500 hover:text-orange-600 font-medium">
              Show More
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {basketballNews.map((article, index) => (
              <motion.article
                key={article.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => handleArticleClick(article.id)}
              >
                <img 
                  src={article.imageUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop"}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{article.author || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{formatNewsTime(article.publishedAt)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="text-orange-500 font-medium mr-2">{article.categoryName || 'Basketball'}</span>
                    <span>{article.viewCount || 0} views</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}

export default HomePage;