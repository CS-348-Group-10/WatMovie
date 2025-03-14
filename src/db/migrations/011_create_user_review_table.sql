CREATE TABLE IF NOT EXISTS user_review (
    user_id INTEGER NOT NULL,
    title_id VARCHAR(36) NOT NULL,
    rating INTEGER NOT NULL,
    review TEXT,
    PRIMARY KEY (user_id, title_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (title_id) REFERENCES titles(title_id) ON DELETE CASCADE
);
