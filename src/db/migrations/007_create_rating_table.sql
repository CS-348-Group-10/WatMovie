CREATE TABLE IF NOT EXISTS ratings (
    title_id VARCHAR(36) PRIMARY KEY,
    sum_of_votes FLOAT8 NOT NULL DEFAULT 0,
    total_votes INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (title_id) REFERENCES titles(title_id) ON DELETE CASCADE
);
