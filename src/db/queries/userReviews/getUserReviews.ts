export const getUserReviewsQuery =
`
SELECT
    uid, 
    first_name,
    last_name,
    rating,
    comment
FROM user_reviews
NATURAL JOIN users
WHERE mid = $1;
`
