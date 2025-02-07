CREATE TABLE IF NOT EXISTS genres_titles (
    genre_id INTEGER,
    title_id VARCHAR(36),
    PRIMARY KEY (genre_id, title_id),
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE,
    FOREIGN KEY (title_id) REFERENCES titles(title_id) ON DELETE CASCADE
);
