require('dotenv').config();
const db = require('./src/utils/db');

const sql = `
CREATE TABLE IF NOT EXISTS notes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) DEFAULT 'Untitled',
    content LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

db.query(sql)
  .then(() => {
    console.log('Notes table created successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating table:', err);
    process.exit(1);
  });
