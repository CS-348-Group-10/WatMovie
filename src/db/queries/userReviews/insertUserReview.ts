// Base query without timestamps
export const insertUserReviewQuery = `
INSERT INTO user_reviews (
  uid, mid, rating, comment
) 
VALUES (
  $1, $2, $3, $4
)
RETURNING *;
`

// Query with timestamps
export const insertUserReviewWithTimestampsQuery = `
INSERT INTO user_reviews (
  uid, mid, rating, comment, created_at, updated_at
) 
VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING *;
`
