export const updateMovieUserRatingQuery = `
UPDATE movies m
SET user_rating_sum = COALESCE(r.sum_ratings, 0),
    user_rating_count = COALESCE(r.count_ratings, 0)
FROM (
    SELECT mid, 
           SUM(rating) AS sum_ratings, 
           COUNT(*) AS count_ratings
    FROM user_reviews
    GROUP BY mid
) r
WHERE m.mid = r.mid;
`