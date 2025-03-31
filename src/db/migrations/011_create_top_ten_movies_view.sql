DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = 'top_ten_movies'
    ) THEN
        CREATE MATERIALIZED VIEW top_ten_movies AS
        SELECT
            mid, 
            name, 
            is_adult,
            release_year, 
            runtime_minutes,
            user_rating_count,
            user_rating_sum / user_rating_count AS average_rating
        FROM movies
        WHERE user_rating_count > 0
        ORDER BY average_rating DESC, user_rating_count DESC
        LIMIT 10;
    END IF;
END $$;