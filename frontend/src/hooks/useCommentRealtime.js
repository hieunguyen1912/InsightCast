import { useState, useEffect, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import commentService from '../features/comment/api';
import { authService } from '../features/auth/api';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8081/ws';

export function useCommentRealtime(articleId, onReplyCreated = null) {
  const [comments, setComments] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Setup WebSocket connection
  useEffect(() => {
    if (!articleId) {
      return;
    }

    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Add JWT token if available
    const token = authService.getToken();
    if (token) {
      client.configure({
        connectHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    // Handle connection
    client.onConnect = (frame) => {
      console.log('WebSocket connected:', frame);
      setIsConnected(true);
      setError(null);

      // Subscribe to comments topic
      const subscription = client.subscribe(
        `/topic/comments/${articleId}`,
        (message) => {
          try {
            const event = JSON.parse(message.body);
            handleCommentEvent(event);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        }
      );
      subscriptionRef.current = subscription;
    };

    // Handle errors
    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setError('WebSocket connection error');
      setIsConnected(false);
    };

    // Handle disconnection
    client.onDisconnect = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    // Activate connection
    client.activate();
    stompClientRef.current = client;

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [articleId]);

  // Handle comment events from WebSocket
  const handleCommentEvent = useCallback((event) => {
    switch (event.action) {
      case 'created':
        // Add new top-level comment
        setComments(prev => {
          const exists = prev.find(c => c.id === event.comment.id);
          if (exists) {
            return prev.map(c =>
              c.id === event.comment.id ? event.comment : c
            );
          }
          return [event.comment, ...prev];
        });
        break;

      case 'reply_created':
        // Update repliesCount of parent comment
        setComments(prev =>
          prev.map(comment => {
            if (comment.id === event.parentCommentId) {
              return {
                ...comment,
                repliesCount: (comment.repliesCount || 0) + 1
              };
            }
            return comment;
          })
        );
        // Notify CommentSection with the full reply object from WebSocket
        if (onReplyCreated && event.comment) {
          onReplyCreated(event.parentCommentId, event.comment);
        }
        break;

      case 'updated':
        // Update comment
        setComments(prev =>
          prev.map(c =>
            c.id === event.comment.id ? event.comment : c
          )
        );
        break;

      case 'deleted':
        // Remove comment
        setComments(prev =>
          prev.filter(c => c.id !== event.commentId)
        );
        break;

      default:
        console.warn('Unknown comment event action:', event.action);
    }
  }, [onReplyCreated]);

  // Load initial comments
  const loadComments = useCallback(async () => {
    if (!articleId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await commentService.getComments(articleId);
      
      if (result.success) {
        setComments(result.data || []);
      } else {
        setError(result.error || 'Failed to load comments');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  // Load comments on mount and when articleId changes
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Create comment
  const createComment = useCallback(async (content, parentId = null) => {
    if (!articleId) {
      throw new Error('Article ID is required');
    }

    try {
      setLoading(true);
      const result = await commentService.createComment(articleId, content, parentId);
      
      if (result.success) {
        // Comment will be broadcast via WebSocket, no need to manually update
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create comment');
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  // Update comment
  const updateComment = useCallback(async (commentId, content) => {
    if (!articleId) {
      throw new Error('Article ID is required');
    }

    try {
      setLoading(true);
      const result = await commentService.updateComment(articleId, commentId, content);
      
      if (result.success) {
        // Comment will be broadcast via WebSocket
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update comment');
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  // Delete comment
  const deleteComment = useCallback(async (commentId) => {
    if (!articleId) {
      throw new Error('Article ID is required');
    }

    try {
      setLoading(true);
      const result = await commentService.deleteComment(articleId, commentId);
      
      if (result.success) {
        // Comment will be broadcast via WebSocket
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  // Get replies for a comment
  const loadReplies = useCallback(async (commentId) => {
    try {
      const result = await commentService.getReplies(commentId);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error loading replies:', err);
      return [];
    }
  }, []);

  return {
    comments,
    isConnected,
    error,
    loading,
    createComment,
    updateComment,
    deleteComment,
    loadComments,
    loadReplies,
    refreshComments: loadComments
  };
}

