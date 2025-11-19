/**
 * Admin Article Edit Page
 * Standalone page for editing articles (Admin only)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useRole } from '../../../hooks/useRole';
import { ArrowLeft } from 'lucide-react';
import AdminArticleEditor from '../components/AdminArticleEditor';
import adminService from '../api';
import { Spinner } from '../../../components/common';

function AdminArticleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    if (id) {
      loadArticle();
    } else {
      setError('Article ID is required');
      setLoading(false);
    }
  }, [id, isAuthenticated, isAdmin, navigate]);

  const loadArticle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminService.getArticleById(id);
      
      if (result.success) {
        setArticle(result.data);
      } else {
        setError(result.error || 'Failed to load article');
      }
    } catch (err) {
      console.error('Error loading article:', err);
      setError('An unexpected error occurred while loading article');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (updatedArticle) => {
    // Navigate back to articles management
    navigate('/admin?module=all-articles');
  };

  const handleCancel = () => {
    // Navigate back to articles management
    navigate('/admin?module=all-articles');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin?module=all-articles')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Articles Management</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600 mt-1">
            Update article details below
          </p>
        </div>

        {/* Editor */}
        {article && (
          <AdminArticleEditor
            article={article}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

export default AdminArticleEditPage;

