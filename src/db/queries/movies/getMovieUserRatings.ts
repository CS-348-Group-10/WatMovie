export const getMovieUserRatingsQuery =
`
WITH all_daily_ratings AS (
    SELECT 
        DATE_TRUNC('day', updated_at) AS rating_day,
        AVG(rating) AS avg_rating
    FROM user_reviews
    WHERE mid = $1
    GROUP BY DATE_TRUNC('day', updated_at)
),
date_series AS (
    SELECT generate_series(
        (SELECT MIN(rating_day) FROM all_daily_ratings),
        CURRENT_DATE, 
        '1 day'::interval
    )::date AS rating_day
),
filled_ratings AS (
    SELECT d.rating_day, COALESCE(dr.avg_rating, NULL) AS avg_rating
    FROM date_series d
    LEFT JOIN all_daily_ratings dr ON d.rating_day = dr.rating_day
),
moving_avg AS (
    SELECT 
        rating_day,
        AVG(avg_rating) OVER (
            ORDER BY rating_day 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_moving_avg
    FROM filled_ratings
)
SELECT * FROM moving_avg
WHERE rating_day >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY rating_day;
`
