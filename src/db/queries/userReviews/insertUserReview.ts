export const insertUserReviewQuery =
`
INSERT INTO user_review (
    user_id,
    title_id,
    rating,
    review
) VALUES (
    $1,
    $2,
    $3,
    $4
)
`
