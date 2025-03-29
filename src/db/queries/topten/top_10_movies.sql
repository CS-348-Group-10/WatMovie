CREATE OR REPLACE VIEW top_10_movies AS
SELECT 
    mid, 
    name, 
    is_adult,
    release_year, 
    runtime_minutes,  
    user_rating_count, 
    user_rating_sum / user_rating_count AS average_rating
FROM movies
WHERE user_rating_count > 0  -- Ensure there are ratings to calculate the average
ORDER BY average_rating DESC, user_rating_count DESC  -- Sort by the highest average rating
LIMIT 10;