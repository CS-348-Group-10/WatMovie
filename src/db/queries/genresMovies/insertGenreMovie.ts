export const insertGenreMovieQuery =
`
INSERT INTO genres_movies (gid, mid) VALUES ($1, $2)
`
