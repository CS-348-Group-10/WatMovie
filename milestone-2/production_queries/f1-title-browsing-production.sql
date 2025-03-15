SELECT 
    T.title_id AS id,
    T.type_id,
    T.name AS title,
    T.is_adult,
    T.start_year,
    T.end_year,
    T.runtime_minutes AS duration,
    R.sum_of_votes / R.total_votes AS rating,
    R.total_votes AS votes,
    CASE
        WHEN COUNT(GT.genre_id) = 0 THEN NULL
        ELSE ARRAY_AGG(GT.genre_id)
    END AS genre_ids
FROM titles T
LEFT JOIN ratings R ON T.title_id = R.title_id
LEFT JOIN genres_titles GT ON T.title_id = GT.title_id
WHERE 2000 IS NULL OR T.start_year >= 2000
GROUP BY
    T.title_id,
    T.type_id,
    T.name,
    T.is_adult,
    T.start_year,
    T.end_year,
    T.runtime_minutes,
    R.sum_of_votes,
    R.total_votes
LIMIT 10;