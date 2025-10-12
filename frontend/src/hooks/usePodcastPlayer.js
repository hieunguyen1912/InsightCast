/**
 * Custom hook for podcast player functionality
 * Manages audio playback state, controls, and progress tracking
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { formatDuration, getTimeRemaining } from '../utils/formatTime';

export function usePodcastPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      // Cleanup event listeners
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  // Load episode
  const loadEpisode = useCallback((episode) => {
    if (!audioRef.current || !episode?.audioUrl) return;

    setCurrentEpisode(episode);
    setError(null);
    setIsLoading(true);
    
    audioRef.current.src = episode.audioUrl;
    audioRef.current.load();
  }, []);

  // Play/pause toggle
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Seek to specific time
  const seekTo = useCallback((time) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Set volume
  const changeVolume = useCallback((newVolume) => {
    if (!audioRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
  }, []);

  // Set playback rate
  const changePlaybackRate = useCallback((rate) => {
    if (!audioRef.current) return;
    
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  // Skip forward/backward
  const skipForward = useCallback((seconds = 30) => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(audioRef.current.currentTime + seconds, duration);
    seekTo(newTime);
  }, [duration, seekTo]);

  const skipBackward = useCallback((seconds = 30) => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
    seekTo(newTime);
  }, [seekTo]);

  // Format time helpers
  const formattedCurrentTime = formatDuration(currentTime, duration >= 3600);
  const formattedDuration = formatDuration(duration, duration >= 3600);
  const formattedTimeRemaining = getTimeRemaining(currentTime, duration);

  // Progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    currentEpisode,
    playbackRate,
    
    // Formatted values
    formattedCurrentTime,
    formattedDuration,
    formattedTimeRemaining,
    progressPercentage,
    
    // Actions
    loadEpisode,
    togglePlayPause,
    seekTo,
    changeVolume,
    changePlaybackRate,
    skipForward,
    skipBackward,
    
    // Audio element ref (for advanced usage)
    audioRef
  };
}
