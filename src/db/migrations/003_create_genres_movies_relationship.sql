CREATE TABLE IF NOT EXISTS genres_movies (
    gid INTEGER,
    mid VARCHAR(36),
    PRIMARY KEY (gid, mid),
    FOREIGN KEY (gid) REFERENCES genres(gid) ON DELETE CASCADE,
    FOREIGN KEY (mid) REFERENCES movies(mid) ON DELETE CASCADE
);
