/**
 * Category Page
 * Displays articles filtered by category
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import categoryService from '../features/category/api';
import { ArticleCard } from '../components/cards';

function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) {
        setError('Category ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch category info, breadcrumb and articles in parallel
        const [categoryResult, breadcrumbResult, articlesResult] = await Promise.all([
          categoryService.getCategoryById(categoryId),
          categoryService.getCategoryBreadcrumb(categoryId),
          categoryService.getArticlesByCategory(categoryId, {
            page: pagination.page,
            size: pagination.size,
            sortBy: 'publishedAt',
            sortDirection: 'desc'
          })
        ]);

        if (categoryResult.success) {
          setCategory(categoryResult.data?.data || categoryResult.data);
        } else {
          setError(categoryResult.error || 'Category not found');
        }

        if (breadcrumbResult.success) {
          const breadcrumbData = breadcrumbResult.data?.data || breadcrumbResult.data || [];
          setBreadcrumb(Array.isArray(breadcrumbData) ? breadcrumbData : []);
        }

        if (articlesResult.success) {
          const data = articlesResult.data;
          setArticles(data.content || []);
          setPagination(prev => ({
            ...prev,
            totalElements: data.totalElements || 0,
            totalPages: data.totalPages || 0
          }));
        } else {
          setError(articlesResult.error || 'Failed to load articles');
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, pagination.page]);

  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="mb-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
            <Link 
              to="/" 
              className="hover:text-orange-500 transition-colors"
            >
              Home
            </Link>
            
            {breadcrumb.length > 0 ? (
              <>
                {breadcrumb.map((item, index) => {
                  // Check if this is the last item and if it matches current category
                  const isLastItem = index === breadcrumb.length - 1;
                  const isCurrentCategory = category && (item.id === category.id || item.id === Number(categoryId));
                  
                  return (
                    <React.Fragment key={item.id || index}>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      {isLastItem && isCurrentCategory ? (
                        // Last item is current category, don't make it clickable
                        <span className="text-gray-900 font-medium">
                          {item.name}
                        </span>
                      ) : (
                        // Parent categories, make them clickable
                        <Link
                          to={`/category/${item.id}`}
                          className="hover:text-orange-500 transition-colors"
                        >
                          {item.name}
                        </Link>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {category?.name || 'Category'}
                </span>
              </>
            )}
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category?.name || 'Category'}
          </h1>
          
          {category?.description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  layout="vertical"
                  index={index}
                  onClick={handleArticleClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No articles found in this category.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
            >
              Browse other categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;

