ALTER TABLE feedback ADD COLUMN status ENUM('pending', 'done') NOT NULL DEFAULT 'pending';
