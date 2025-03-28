export const getMovieUserRatingsQuery =
`
WITH hourly_ratings AS (
    SELECT 
        DATE_TRUNC('hour', updated_at) AS rating_hour,
        AVG(rating) AS avg_rating
    FROM user_reviews
    WHERE mid = $1
    GROUP BY DATE_TRUNC('hour', updated_at)
)
SELECT 
    rating_hour,
    AVG(avg_rating) OVER (
        ORDER BY rating_hour 
        RANGE BETWEEN INTERVAL '6 hours' PRECEDING AND CURRENT ROW
    ) AS six_hour_moving_avg
FROM hourly_ratings
ORDER BY rating_hour
LIMIT 24;
`
