CREATE TABLE IF NOT EXISTS movies (
    mid VARCHAR(36) PRIMARY KEY,
    name TEXT NOT NULL,
    is_adult BOOLEAN NOT NULL DEFAULT FALSE,
    release_year INTEGER NOT NULL,
    runtime_minutes INTEGER,
    user_rating_sum FLOAT8 NOT NULL DEFAULT 0,
    user_rating_count INTEGER NOT NULL DEFAULT 0

    CHECK (user_rating_count >= 0 AND user_rating_sum >= 0)
);
