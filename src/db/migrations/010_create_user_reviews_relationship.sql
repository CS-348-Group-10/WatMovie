CREATE TABLE IF NOT EXISTS user_reviews (
    uid INTEGER NOT NULL,
    mid VARCHAR(36) NOT NULL,
    rating FLOAT8 NOT NULL,
    comment TEXT,
    PRIMARY KEY (uid, mid),
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (mid) REFERENCES movies(mid) ON DELETE CASCADE

    CHECK (rating >= 0 AND rating <= 10)
);
