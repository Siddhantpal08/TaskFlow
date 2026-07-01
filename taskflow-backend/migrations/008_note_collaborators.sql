CREATE TABLE IF NOT EXISTS note_collaborators (
    page_id VARCHAR(36) NOT NULL,
    user_id INT NOT NULL,
    can_edit BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (page_id, user_id),
    FOREIGN KEY (page_id) REFERENCES notes_pages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
