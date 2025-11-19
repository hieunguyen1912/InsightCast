/**
 * CommentSection Component
 * Displays and manages comments for an article with real-time updates
 */

import React, { useState, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Edit2, 
  Trash2, 
  Reply,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useCommentRealtime } from '../../../hooks/useCommentRealtime';
import { useAuth } from '../../../context/AuthContext';
import { formatNewsTime } from '../../../utils/formatTime';

function CommentSection({ articleId }) {
  const { isAuthenticated, user } = useAuth();
  
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const handleReplyCreated = useCallback((parentCommentId, newReply) => {

    setReplies(prev => {
      const currentReplies = prev[parentCommentId];
      

      if (currentReplies !== undefined) {
        const exists = currentReplies.some(r => r.id === newReply.id);
        if (exists) {
          return {
            ...prev,
            [parentCommentId]: currentReplies.map(r =>
              r.id === newReply.id ? newReply : r
            )
          };
        }
        
        return {
          ...prev,
          [parentCommentId]: [newReply, ...currentReplies]
        };
      }
      
      return prev;
    });
  }, []);

  const {
    comments,
    isConnected,
    error: wsError,
    loading,
    createComment,
    updateComment,
    deleteComment,
    loadReplies
  } = useCommentRealtime(articleId, handleReplyCreated);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      await createComment(content.trim());
      setContent('');
      showMessage('Comment posted successfully', 'success');
    } catch (err) {
      showMessage(err.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      await createComment(replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
      
      // Automatically expand replies if not already expanded
      if (!expandedReplies[parentId]) {
        setExpandedReplies(prev => ({ ...prev, [parentId]: true }));
        // Load replies for the first time
        setLoadingReplies(prev => ({ ...prev, [parentId]: true }));
        try {
          const repliesData = await loadReplies(parentId);
          setReplies(prev => ({ ...prev, [parentId]: repliesData }));
        } catch (err) {
          console.error('Error loading replies:', err);
        } finally {
          setLoadingReplies(prev => ({ ...prev, [parentId]: false }));
        }
      } else {
        
        setReplies(prev => {
          if (prev[parentId] === undefined) {
            loadReplies(parentId).then(repliesData => {
              setReplies(prevState => ({ ...prevState, [parentId]: repliesData }));
            }).catch(err => {
              console.error('Error loading replies:', err);
            });
          }
          return prev;
        });
      }
      
      showMessage('Reply posted successfully', 'success');
    } catch (err) {
      showMessage(err.message || 'Failed to post reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent('');
      showMessage('Comment updated successfully', 'success');
    } catch (err) {
      showMessage(err.message || 'Failed to update comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteComment(commentId);
      showMessage('Comment deleted successfully', 'success');
    } catch (err) {
      showMessage(err.message || 'Failed to delete comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = async (commentId) => {
    if (expandedReplies[commentId]) {
      setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
    } else {
      setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
      if (!replies[commentId]) {
        setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
        try {
          const repliesData = await loadReplies(commentId);
          setReplies(prev => ({ ...prev, [commentId]: repliesData }));
        } catch (err) {
          console.error('Error loading replies:', err);
        } finally {
          setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
        }
      }
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const getAvatarUrl = (user) => {
    if (user?.avatarUrl) return user.avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.username || 'User'
    )}&background=random`;
  };

  const getUserDisplayName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'Anonymous';
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h2>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Live</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <XCircle className="h-4 w-4" />
            <span>Offline</span>
          </div>
        )}
      </div>

      {/* Connection Status Message */}
      {wsError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{wsError}</span>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            messageType === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {messageType === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <img
              src={getAvatarUrl(user)}
              alt={getUserDisplayName(user)}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                maxLength={5000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {content.length}/5000 characters
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Post Comment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">
            Please{' '}
            <a href="/login" className="text-black font-medium hover:underline">
              login
            </a>{' '}
            to post a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0">
              {/* Comment Header */}
              <div className="flex items-start gap-3">
                <img
                  src={getAvatarUrl(comment.user)}
                  alt={getUserDisplayName(comment.user)}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">
                        {getUserDisplayName(comment.user)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatNewsTime(comment.createdAt)}
                      </span>
                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-gray-400 ml-2">(edited)</span>
                      )}
                    </div>
                    {isAuthenticated && user?.id === comment.user?.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          title="Edit comment"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete comment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                        maxLength={5000}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          disabled={!editContent.trim() || isSubmitting}
                          className="px-3 py-1 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">
                      {comment.content}
                    </p>
                  )}

                  {/* Comment Actions */}
                  {editingId !== comment.id && (
                    <div className="flex items-center gap-4">
                      {isAuthenticated && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                          <Reply className="h-4 w-4" />
                          <span>Reply</span>
                        </button>
                      )}
                      {comment.repliesCount > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          {expandedReplies[comment.id]
                            ? 'Hide'
                            : `View ${comment.repliesCount} ${comment.repliesCount === 1 ? 'reply' : 'replies'}`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-200">
                      <div className="flex gap-3">
                        <img
                          src={getAvatarUrl(user)}
                          alt={getUserDisplayName(user)}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                            maxLength={5000}
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyContent.trim() || isSubmitting}
                              className="px-3 py-1 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                              Post Reply
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {expandedReplies[comment.id] && (
                    <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-200 space-y-4">
                      {loadingReplies[comment.id] ? (
                        <div className="text-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                        </div>
                      ) : replies[comment.id]?.length > 0 ? (
                        replies[comment.id].map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <img
                              src={getAvatarUrl(reply.user)}
                              alt={getUserDisplayName(reply.user)}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <span className="font-medium text-gray-900 text-sm">
                                    {getUserDisplayName(reply.user)}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {formatNewsTime(reply.createdAt)}
                                  </span>
                                </div>
                                {isAuthenticated && user?.id === reply.user?.id && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleDelete(reply.id)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title="Delete reply"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No replies yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;

