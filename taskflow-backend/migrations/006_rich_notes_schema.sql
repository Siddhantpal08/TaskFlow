-- 006_rich_notes_schema.sql
-- Creates the notes_pages and notes_blocks tables needed for the block-based
-- notes editor. Also adds the user_plan column for freemium gating.
-- Run this after 005_note_sharing.sql

-- ── Notes Pages (hierarchical, tree structure) ────────────────────────────────
CREATE TABLE IF NOT EXISTS notes_pages (
  id          VARCHAR(36)  PRIMARY KEY,                  -- UUID
  user_id     INT UNSIGNED NOT NULL,
  parent_id   VARCHAR(36)  DEFAULT NULL,                 -- NULL = root-level
  title       VARCHAR(255) DEFAULT 'Untitled',
  emoji       VARCHAR(10)  DEFAULT '📄',
  position    INT          DEFAULT 0,
  writing_mode VARCHAR(20) DEFAULT NULL,                 -- 'script' | 'lyrics' | NULL
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES notes_pages(id) ON DELETE CASCADE,
  INDEX idx_user_parent (user_id, parent_id),
  INDEX idx_position    (position)
);

-- ── Notes Blocks ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes_blocks (
  id          VARCHAR(36)   PRIMARY KEY,                 -- UUID
  page_id     VARCHAR(36)   NOT NULL,
  type        VARCHAR(30)   DEFAULT 'p',                 -- p|h1|h2|h3|ul|ol|todo|quote|callout|code|divider|link|verse|chorus|...
  content     MEDIUMTEXT,                               -- MEDIUMTEXT saves space vs LONGTEXT for most blocks
  checked     TINYINT(1)    DEFAULT 0,
  position    INT           DEFAULT 0,
  indent      INT           DEFAULT 0,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES notes_pages(id) ON DELETE CASCADE,
  INDEX idx_page_position (page_id, position)
);

-- ── Note Share Tokens ─────────────────────────────────────────────────────────
-- (already created in 005_note_sharing.sql — kept here for reference)
CREATE TABLE IF NOT EXISTS note_shares (
  id          VARCHAR(36)  PRIMARY KEY,
  token       VARCHAR(64)  NOT NULL UNIQUE,
  page_id     VARCHAR(36)  NOT NULL,
  shared_by   INT UNSIGNED NOT NULL,
  expires_at  DATETIME     NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id)   REFERENCES notes_pages(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ── User Plan (Freemium) ──────────────────────────────────────────────────────
-- Stores 'free' or 'pro' per user. Defaults to 'free'.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan ENUM('free', 'pro') DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP NULL DEFAULT NULL;

-- ── Storage Optimization: Add COMPRESSION hint (MySQL 5.7+ InnoDB) ────────────
-- This reduces disk usage for large content columns by ~40-60%.
ALTER TABLE notes_blocks ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=4;

-- ── Cleanup: Remove orphaned blocks whose page was deleted ────────────────────
DELETE nb FROM notes_blocks nb
LEFT JOIN notes_pages np ON nb.page_id = np.id
WHERE np.id IS NULL;

-- ── Auto-cleanup: Old share tokens (safe to run periodically) ─────────────────
DELETE FROM note_shares WHERE expires_at < NOW();
