-- =====================================================
-- PodcastAI Database Migration - RBAC Tables
-- Version: 9.0
-- Description: Create RBAC (Role-Based Access Control) tables for permission management
-- =====================================================

-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_by VARCHAR(50),
    version BIGINT DEFAULT 0
);

-- Create permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    resource VARCHAR(50),
    action VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_by VARCHAR(50),
    version BIGINT DEFAULT 0
);

-- Create user_roles table (Many-to-Many: User <-> Role)
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

-- Create role_permissions table (Many-to-Many: Role <-> Permission)
CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_roles_code ON roles(code);

-- Insert default roles
INSERT INTO roles (name, code, description, is_active, created_at, updated_at, created_by)
VALUES 
    ('Administrator', 'ADMIN', 'Full system access with all permissions', TRUE, NOW(), NOW(), 'system'),
    ('Moderator', 'MODERATOR', 'Can moderate content and manage users', TRUE, NOW(), NOW(), 'system'),
    ('User', 'USER', 'Standard user with basic permissions', TRUE, NOW(), NOW(), 'system');

-- Insert common permissions
INSERT INTO permissions (name, code, description, resource, action, is_active, created_at, updated_at, created_by)
VALUES 
    -- Article permissions
    ('Create Article', 'ARTICLE_CREATE', 'Permission to create new articles', 'ARTICLE', 'CREATE', TRUE, NOW(), NOW(), 'system'),
    ('Read Article', 'ARTICLE_READ', 'Permission to view articles', 'ARTICLE', 'READ', TRUE, NOW(), NOW(), 'system'),
    ('Update Article', 'ARTICLE_UPDATE', 'Permission to update articles', 'ARTICLE', 'UPDATE', TRUE, NOW(), NOW(), 'system'),
    ('Delete Article', 'ARTICLE_DELETE', 'Permission to delete articles', 'ARTICLE', 'DELETE', TRUE, NOW(), NOW(), 'system'),
    ('Publish Article', 'ARTICLE_PUBLISH', 'Permission to publish articles', 'ARTICLE', 'PUBLISH', TRUE, NOW(), NOW(), 'system'),
    ('Approve Article', 'ARTICLE_APPROVE', 'Permission to approve articles', 'ARTICLE', 'APPROVE', TRUE, NOW(), NOW(), 'system'),
    
    -- User permissions
    ('Create User', 'USER_CREATE', 'Permission to create new users', 'USER', 'CREATE', TRUE, NOW(), NOW(), 'system'),
    ('Read User', 'USER_READ', 'Permission to view user information', 'USER', 'READ', TRUE, NOW(), NOW(), 'system'),
    ('Update User', 'USER_UPDATE', 'Permission to update user information', 'USER', 'UPDATE', TRUE, NOW(), NOW(), 'system'),
    ('Delete User', 'USER_DELETE', 'Permission to delete users', 'USER', 'DELETE', TRUE, NOW(), NOW(), 'system'),
    
    -- Role permissions
    ('Create Role', 'ROLE_CREATE', 'Permission to create roles', 'ROLE', 'CREATE', TRUE, NOW(), NOW(), 'system'),
    ('Read Role', 'ROLE_READ', 'Permission to view roles', 'ROLE', 'READ', TRUE, NOW(), NOW(), 'system'),
    ('Update Role', 'ROLE_UPDATE', 'Permission to update roles', 'ROLE', 'UPDATE', TRUE, NOW(), NOW(), 'system'),
    ('Delete Role', 'ROLE_DELETE', 'Permission to delete roles', 'ROLE', 'DELETE', TRUE, NOW(), NOW(), 'system'),
    
    -- Permission permissions
    ('Create Permission', 'PERMISSION_CREATE', 'Permission to create permissions', 'PERMISSION', 'CREATE', TRUE, NOW(), NOW(), 'system'),
    ('Read Permission', 'PERMISSION_READ', 'Permission to view permissions', 'PERMISSION', 'READ', TRUE, NOW(), NOW(), 'system'),
    ('Update Permission', 'PERMISSION_UPDATE', 'Permission to update permissions', 'PERMISSION', 'UPDATE', TRUE, NOW(), NOW(), 'system'),
    ('Delete Permission', 'PERMISSION_DELETE', 'Permission to delete permissions', 'PERMISSION', 'DELETE', TRUE, NOW(), NOW(), 'system'),
    
    -- Category permissions
    ('Create Category', 'CATEGORY_CREATE', 'Permission to create categories', 'CATEGORY', 'CREATE', TRUE, NOW(), NOW(), 'system'),
    ('Read Category', 'CATEGORY_READ', 'Permission to view categories', 'CATEGORY', 'READ', TRUE, NOW(), NOW(), 'system'),
    ('Update Category', 'CATEGORY_UPDATE', 'Permission to update categories', 'CATEGORY', 'UPDATE', TRUE, NOW(), NOW(), 'system'),
    ('Delete Category', 'CATEGORY_DELETE', 'Permission to delete categories', 'CATEGORY', 'DELETE', TRUE, NOW(), NOW(), 'system'),
    
    -- Audio permissions
    ('Create Audio', 'AUDIO_CREATE', 'Permission to create audio files', 'AUDIO', 'CREATE', TRUE, NOW(), NOW(), 'system'),
    ('Read Audio', 'AUDIO_READ', 'Permission to view audio files', 'AUDIO', 'READ', TRUE, NOW(), NOW(), 'system'),
    ('Update Audio', 'AUDIO_UPDATE', 'Permission to update audio files', 'AUDIO', 'UPDATE', TRUE, NOW(), NOW(), 'system'),
    ('Delete Audio', 'AUDIO_DELETE', 'Permission to delete audio files', 'AUDIO', 'DELETE', TRUE, NOW(), NOW(), 'system');

-- Assign permissions to ADMIN role (all permissions)
INSERT INTO role_permissions (role_id, permission_id, is_active, created_at, updated_at)
SELECT 
    r.id AS role_id,
    p.id AS permission_id,
    TRUE,
    NOW(),
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'ADMIN';

-- Assign basic permissions to USER role
INSERT INTO role_permissions (role_id, permission_id, is_active, created_at, updated_at)
SELECT 
    r.id AS role_id,
    p.id AS permission_id,
    TRUE,
    NOW(),
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'USER'
AND p.code IN (
    'ARTICLE_READ',
    'USER_READ',
    'CATEGORY_READ',
    'AUDIO_READ',
    'AUDIO_CREATE'
);

-- Assign permissions to MODERATOR role
INSERT INTO role_permissions (role_id, permission_id, is_active, created_at, updated_at)
SELECT 
    r.id AS role_id,
    p.id AS permission_id,
    TRUE,
    NOW(),
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'MODERATOR'
AND p.code IN (
    'ARTICLE_CREATE',
    'ARTICLE_READ',
    'ARTICLE_UPDATE',
    'ARTICLE_PUBLISH',
    'ARTICLE_APPROVE',
    'USER_READ',
    'USER_UPDATE',
    'CATEGORY_CREATE',
    'CATEGORY_READ',
    'CATEGORY_UPDATE',
    'AUDIO_CREATE',
    'AUDIO_READ',
    'AUDIO_UPDATE'
);

