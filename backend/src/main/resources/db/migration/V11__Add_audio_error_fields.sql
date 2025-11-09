-- =====================================================
-- PodcastAI Database Migration - Add Audio Error Fields
-- Version: 11.0
-- Description: Add error tracking fields to audio_files table
-- =====================================================

-- Add error_message column to audio_files table
ALTER TABLE audio_files 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add error_code column to audio_files table
ALTER TABLE audio_files 
ADD COLUMN IF NOT EXISTS error_code VARCHAR(50);

-- Add retry_count column to audio_files table
ALTER TABLE audio_files 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN audio_files.error_message IS 'Error message when audio generation fails';
COMMENT ON COLUMN audio_files.error_code IS 'Error code for categorizing failures (e.g., QUOTA_EXCEEDED, TIMEOUT, INVALID_INPUT)';
COMMENT ON COLUMN audio_files.retry_count IS 'Number of retry attempts for failed audio generation';

