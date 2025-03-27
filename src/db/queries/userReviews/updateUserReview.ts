export const updateUserReviewQuery =
`
UPDATE user_reviews
SET
    rating = $3,
    comment = $4,
    updated_at = NOW()
WHERE uid = $1 AND mid = $2
`
