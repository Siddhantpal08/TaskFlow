-- 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,  -- bcrypt hash
  avatar_initials CHAR(2),             -- e.g. 'SP'
  is_online   TINYINT(1)   DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token       VARCHAR(512) NOT NULL UNIQUE,
  expires_at  TIMESTAMP    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255)  NOT NULL,
  description     TEXT,
  priority        ENUM('low','medium','high') DEFAULT 'medium',
  status          ENUM('pending','active','done') DEFAULT 'pending',
  assigned_by     INT UNSIGNED NOT NULL,  -- creator
  assigned_to     INT UNSIGNED NOT NULL,  -- current assignee
  parent_task_id  INT UNSIGNED,           -- delegation chain (nullable)
  due_date        DATE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_by)    REFERENCES users(id),
  FOREIGN KEY (assigned_to)    REFERENCES users(id),
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notes_pages (
  id          VARCHAR(36)  PRIMARY KEY,  -- UUID
  user_id     INT UNSIGNED NOT NULL,
  parent_id   VARCHAR(36),               -- nullable (top-level)
  title       VARCHAR(255) DEFAULT 'Untitled',
  emoji       VARCHAR(8),
  position    INT UNSIGNED DEFAULT 0,    -- order among siblings
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes_blocks (
  id          VARCHAR(36)  PRIMARY KEY,
  page_id     VARCHAR(36)  NOT NULL,
  type        ENUM('h1','h2','h3','p','todo','quote','callout','code') DEFAULT 'p',
  content     TEXT,
  checked     TINYINT(1) DEFAULT 0,      -- for todo blocks
  position    INT UNSIGNED DEFAULT 0,
  FOREIGN KEY (page_id) REFERENCES notes_pages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  event_date  DATE NOT NULL,
  event_time  TIME,
  priority    ENUM('low','medium','high') DEFAULT 'low',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,      -- recipient
  type        ENUM('task_assigned','task_delegated','status_update','event_created','due_soon'),
  message     TEXT         NOT NULL,
  is_read     TINYINT(1)  DEFAULT 0,
  ref_id      INT UNSIGNED,               -- task or event ID it refers to
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
