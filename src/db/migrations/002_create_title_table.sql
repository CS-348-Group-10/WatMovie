CREATE TABLE IF NOT EXISTS titles (
    title_id VARCHAR(36) PRIMARY KEY,
    type TEXT,
    name TEXT NOT NULL,
    is_adult BOOLEAN NOT NULL DEFAULT FALSE,
    start_year INTEGER,
    end_year INTEGER,
    runtime_minutes INTEGER
);
