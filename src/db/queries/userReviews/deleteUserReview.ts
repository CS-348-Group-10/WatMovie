export const deleteUserReviewQuery =
`
DELETE FROM user_reviews
WHERE uid = $1 AND mid = $2
`