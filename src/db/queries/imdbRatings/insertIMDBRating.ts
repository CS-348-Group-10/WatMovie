export const insertIMDBRatingQuery =
`
INSERT INTO imdb_ratings (mid, sum_of_votes, total_votes)
VALUES ($1, $2, $3)
`
