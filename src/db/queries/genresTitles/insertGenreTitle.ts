export const insertGenreTitleQuery =
`
INSERT INTO genres_titles (genre_id, title_id) VALUES ($1, $2)
`
