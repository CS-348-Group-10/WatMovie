CREATE TABLE IF NOT EXISTS movie_cast (
    mid VARCHAR(36) NOT NULL,
    ordering INTEGER NOT NULL,
    pid VARCHAR(36) NOT NULL,
    rid INTEGER NOT NULL,
    job VARCHAR(255),
    characters TEXT,
    
    PRIMARY KEY (mid, ordering),
    FOREIGN KEY (mid) REFERENCES movies(mid) ON DELETE CASCADE,
    FOREIGN KEY (pid) REFERENCES movie_professionals(pid) ON DELETE CASCADE,
    FOREIGN KEY (rid) REFERENCES movie_roles(rid) ON DELETE CASCADE
);
