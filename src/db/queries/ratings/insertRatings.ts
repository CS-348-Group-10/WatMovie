export const insertRatingQuery =
`
INSERT INTO ratings (title_id, sum_of_votes, total_votes)
VALUES ($1, $2, $3)
`
