-- =====================================================
-- PodcastAI Database Migration - Move Default TTS Config to Users
-- Version: 12.0
-- Description: Move default_tts_config_id from user_news_preferences to users table
-- =====================================================

-- Step 1: Add default_tts_config_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS default_tts_config_id BIGINT;

-- Step 2: Add foreign key constraint
ALTER TABLE users
ADD CONSTRAINT fk_users_default_tts_config 
FOREIGN KEY (default_tts_config_id) 
REFERENCES tts_configs(id) 
ON DELETE SET NULL;

-- Step 3: Migrate existing data from user_news_preferences to users
-- (if user_news_preferences table exists and has default_tts_config_id)
UPDATE users u
SET default_tts_config_id = unp.default_tts_config_id
FROM user_news_preferences unp
WHERE u.id = unp.user_id
  AND unp.default_tts_config_id IS NOT NULL
  AND u.default_tts_config_id IS NULL;

-- Step 4: Remove default_tts_config_id from user_news_preferences if it exists
-- (This will be handled by JPA entity update, but we can also do it here)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_news_preferences' 
        AND column_name = 'default_tts_config_id'
    ) THEN
        ALTER TABLE user_news_preferences 
        DROP CONSTRAINT IF EXISTS fk_user_news_preferences_default_tts_config;
        
        ALTER TABLE user_news_preferences 
        DROP COLUMN IF EXISTS default_tts_config_id;
    END IF;
END $$;

-- Step 5: Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_default_tts_config_id 
ON users(default_tts_config_id);

-- Add comment for documentation
COMMENT ON COLUMN users.default_tts_config_id IS 'Reference to the default TTS configuration for this user';

