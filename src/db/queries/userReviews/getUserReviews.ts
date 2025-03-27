export const getUserReviewsQuery =
`
SELECT
    uid, 
    first_name,
    last_name,
    rating,
    comment,
    created_at,
    updated_at
FROM user_reviews
NATURAL JOIN users
WHERE mid = $1;
`
