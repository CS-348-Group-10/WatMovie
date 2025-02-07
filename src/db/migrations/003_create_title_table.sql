CREATE TABLE IF NOT EXISTS titles (
    title_id VARCHAR(36) PRIMARY KEY,
    type_id INTEGER,
    name TEXT NOT NULL,
    is_adult BOOLEAN NOT NULL DEFAULT FALSE,
    start_year INTEGER,
    end_year INTEGER,
    runtime_minutes INTEGER,

    FOREIGN KEY (type_id) REFERENCES title_types(type_id) ON DELETE CASCADE
);
