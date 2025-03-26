CREATE TABLE IF NOT EXISTS movies (
    mid VARCHAR(36) PRIMARY KEY,
    name TEXT NOT NULL,
    is_adult BOOLEAN NOT NULL DEFAULT FALSE,
    release_year INTEGER NOT NULL,
    runtime_minutes INTEGER
);
