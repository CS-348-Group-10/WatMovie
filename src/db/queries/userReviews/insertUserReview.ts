export const insertUserReviewQuery =
`
INSERT INTO user_reviews (uid, mid, rating, comment) 
VALUES ($1,$2,$3,$4)
`
