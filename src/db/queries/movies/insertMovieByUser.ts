export const insertMovieByUserQuery =
`
INSERT INTO movies (mid, name, is_adult, release_year, runtime_minutes, user_rating_sum, user_rating_count)
VALUES ($1, $2, $3, $4, $5, $6, $7);
`
