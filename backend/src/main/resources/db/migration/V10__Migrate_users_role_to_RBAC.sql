-- =====================================================
-- PodcastAI Database Migration - Migrate User Role to RBAC
-- Version: 10.0
-- Description: Migrate existing user roles from users.role column to user_roles table
-- =====================================================

-- Migrate existing user roles to user_roles table
-- This migration assumes that roles table already has USER, ADMIN, MODERATOR roles
INSERT INTO user_roles (user_id, role_id, is_active, created_at, updated_at)
SELECT 
    u.id AS user_id,
    r.id AS role_id,
    TRUE AS is_active,
    u.created_at AS created_at,
    NOW() AS updated_at
FROM users u
INNER JOIN roles r ON r.code = UPPER(u.role)
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
)
AND u.role IS NOT NULL;

-- Note: We keep the users.role column for now for backward compatibility
-- To drop the column later, use:
-- ALTER TABLE users DROP COLUMN role;

