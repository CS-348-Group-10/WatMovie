export const getMovieUserReviews =
`
SELECT name, comment, rating
FROM user_reviews as t1 
NATURAL JOIN users t2
WHERE mid = $1;
`
