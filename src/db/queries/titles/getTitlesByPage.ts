export const getTitlesByPageQuery = 
`
SELECT 
    T.title_id AS id,
    T.type_id,
    T.name AS title,
    T.is_adult,
    T.start_year,
    T.end_year,
    T.runtime_minutes AS duration,
    R.sum_of_votes / (R.total_votes * 2) AS rating,
    CASE
        WHEN COUNT(GT.genre_id) = 0 THEN NULL
        ELSE ARRAY_AGG(GT.genre_id)
    END AS genres
FROM titles T
LEFT JOIN ratings R ON T.title_id = R.title_id
LEFT JOIN genres_titles GT ON T.title_id = GT.title_id
WHERE 
    ($1::TEXT IS NULL OR T.name ILIKE '%' || $1 || '%')
    AND ($2::BOOLEAN IS NULL OR T.is_adult = $2)
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
ORDER BY T.title_id
LIMIT $3
OFFSET $4;
`
