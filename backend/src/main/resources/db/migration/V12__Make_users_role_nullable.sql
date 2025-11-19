-- =====================================================
-- PodcastAI Database Migration - Make users.role nullable
-- Version: 12.0
-- Description: Make the role column nullable since we've migrated to RBAC
--              The role column is kept for backward compatibility but is no longer required
-- =====================================================

-- Remove the NOT NULL constraint from the role column
ALTER TABLE users 
ALTER COLUMN role DROP NOT NULL;

-- Remove the check constraint since we're no longer using this column
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS chk_user_role;

-- Update comment to reflect that this column is deprecated
COMMENT ON COLUMN users.role IS 'DEPRECATED: User role column kept for backward compatibility. Use user_roles table instead.';

