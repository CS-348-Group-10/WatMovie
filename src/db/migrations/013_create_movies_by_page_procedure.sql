CREATE OR REPLACE FUNCTION get_movies_by_page(
    search_text TEXT,
    is_adult BOOLEAN,
    release_year_start INTEGER,
    release_year_end INTEGER,
    runtime_minutes_start INTEGER,
    runtime_minutes_end INTEGER,
    imdb_rating_min NUMERIC,
    imdb_rating_max NUMERIC,
    imdb_votes_min INTEGER,
    genre_ids INTEGER[],
    sort_by TEXT,
    sort_order TEXT,
    limit_count INTEGER,
    offset_count INTEGER
)
RETURNS TABLE(
    id VARCHAR,
    movie TEXT,
    is_adult BOOLEAN,
    release_year INTEGER,
    duration INTEGER,
    imdb_rating NUMERIC,
    imdb_votes INTEGER,
    user_rating NUMERIC,
    user_votes INTEGER,
    genre_ids INTEGER[]
)
LANGUAGE SQL AS $$
    SELECT 
        M.mid AS id,
        M.name AS movie,
        M.is_adult,
        M.release_year,
        M.runtime_minutes AS duration,
        ROUND((MR.sum_of_votes / MR.total_votes)::NUMERIC, 1) AS imdb_rating,
        MR.total_votes AS imdb_votes,
        CASE
            WHEN M.user_rating_count = 0 THEN NULL
            ELSE ROUND((M.user_rating_sum / M.user_rating_count)::NUMERIC, 1)
        END AS user_rating,
        M.user_rating_count AS user_votes,
        CASE
            WHEN COUNT(GM.gid) = 0 THEN NULL
            ELSE ARRAY_AGG(GM.gid)
        END AS genre_ids
    FROM movies M
    LEFT JOIN imdb_ratings MR ON M.mid = MR.mid
    LEFT JOIN genres_movies GM ON M.mid = GM.mid
    WHERE 
        (search_text IS NULL OR (M.name ILIKE '%' || search_text || '%'))
        AND (is_adult IS NULL OR M.is_adult = is_adult)
        AND (release_year_start IS NULL OR M.release_year >= release_year_start)
        AND (release_year_end IS NULL OR M.release_year <= release_year_end)
        AND (runtime_minutes_start IS NULL OR M.runtime_minutes >= runtime_minutes_start)
        AND (runtime_minutes_end IS NULL OR M.runtime_minutes <= runtime_minutes_end)
        AND (imdb_rating_min IS NULL OR (MR.sum_of_votes / MR.total_votes >= imdb_rating_min))
        AND (imdb_rating_max IS NULL OR (MR.sum_of_votes / MR.total_votes <= imdb_rating_max))
        AND (imdb_votes_min IS NULL OR MR.total_votes >= imdb_votes_min)
        AND (genre_ids IS NULL OR GM.gid = ANY(genre_ids))
        AND (
            sort_by != 'imdb_rating' 
            OR (MR.sum_of_votes IS NOT NULL AND MR.total_votes IS NOT NULL)
        )
        AND (
            sort_by != 'user_rating'
            OR M.user_rating_count <> 0
        )
        AND (
            sort_by != 'runtime'
            OR M.runtime_minutes IS NOT NULL
        )
    GROUP BY
        M.mid,
        M.name,
        M.is_adult,
        M.release_year,
        M.runtime_minutes,
        MR.sum_of_votes,
        MR.total_votes
    ORDER BY 
        CASE WHEN sort_by = 'imdb_rating' AND sort_order = 'desc' 
             THEN ROUND((MR.sum_of_votes / MR.total_votes)::NUMERIC, 1) END DESC,
        CASE WHEN sort_by = 'imdb_rating' AND sort_order = 'asc' 
             THEN ROUND((MR.sum_of_votes / MR.total_votes)::NUMERIC, 1) END ASC,
        CASE WHEN sort_by = 'user_rating' AND sort_order = 'desc' 
             THEN ROUND((M.user_rating_sum / M.user_rating_count)::NUMERIC, 1) END DESC,
        CASE WHEN sort_by = 'user_rating' AND sort_order = 'asc' 
             THEN ROUND((M.user_rating_sum / M.user_rating_count)::NUMERIC, 1) END ASC,
        CASE WHEN sort_by = 'title' AND sort_order = 'desc' 
             THEN M.name END DESC,
        CASE WHEN sort_by = 'title' AND sort_order = 'asc' 
             THEN M.name END ASC,
        CASE WHEN sort_by = 'year' AND sort_order = 'desc' 
             THEN M.release_year END DESC,
        CASE WHEN sort_by = 'year' AND sort_order = 'asc' 
             THEN M.release_year END ASC,
        CASE WHEN sort_by = 'runtime' AND sort_order = 'desc' 
             THEN M.runtime_minutes END DESC,
        CASE WHEN sort_by = 'runtime' AND sort_order = 'asc' 
             THEN M.runtime_minutes END ASC,
        CASE WHEN sort_by IS NULL OR (sort_by NOT IN ('imdb_rating', 'user_rating', 'title', 'year', 'runtime'))
             THEN M.mid END DESC
    LIMIT limit_count
    OFFSET offset_count;
$$;