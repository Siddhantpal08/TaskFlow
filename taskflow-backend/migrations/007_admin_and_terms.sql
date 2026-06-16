-- 007_admin_and_terms.sql
-- Adds: role column, terms_accepted_at column.
-- Sets palsiddhant3@gmail.com as admin.
-- Run ONCE after deploying backend.

-- Role for admin panel access
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- Terms acceptance timestamp (null = not accepted / old user)
ALTER TABLE users ADD COLUMN terms_accepted_at TIMESTAMP NULL DEFAULT NULL;

-- Promote your admin account
UPDATE users SET role = 'admin' WHERE email = 'palsiddhant3@gmail.com';

-- Index for faster admin user queries
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created ON users(created_at);
