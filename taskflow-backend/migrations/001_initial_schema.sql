-- 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,  -- bcrypt hash
  avatar_initials CHAR(2),             -- e.g. 'SP'
  avatar_url  VARCHAR(255),
  bio         TEXT,
  role        ENUM('admin','user') DEFAULT 'user',
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
  status          ENUM('pending','accepted','in_progress','pending_approval','done') DEFAULT 'pending',
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

-- Simple flat notes table (title + content per note, no blocks/pages tree)
CREATE TABLE IF NOT EXISTS notes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(255) DEFAULT 'Untitled',
  content     TEXT,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
  user_id     INT UNSIGNED NOT NULL,
  type        ENUM('task_assigned','task_delegated','status_update','event_created','due_soon','approval_requested','approval_result'),
  message     TEXT         NOT NULL,
  is_read     TINYINT(1)  DEFAULT 0,
  ref_id      INT UNSIGNED,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
