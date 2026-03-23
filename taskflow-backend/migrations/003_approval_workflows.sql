-- 003_approval_workflows.sql

-- Update the status enum for tasks to include 'pending_approval'
ALTER TABLE tasks MODIFY COLUMN status ENUM('pending', 'active', 'pending_approval', 'done') DEFAULT 'pending';

-- Create table for team leave requests
CREATE TABLE IF NOT EXISTS team_leave_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
