CREATE TABLE IF NOT EXISTS production_team (
    title_id VARCHAR(36) NOT NULL,
    ordering INTEGER NOT NULL,
    member_id VARCHAR(36) NOT NULL,
    category_id INTEGER NOT NULL,
    job VARCHAR(255),
    characters TEXT,
    
    PRIMARY KEY (title_id, ordering),
    FOREIGN KEY (title_id) REFERENCES titles(title_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES production_members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES member_categories(category_id) ON DELETE CASCADE
);
