export const getTitlesByPageQuery = 
`
SELECT 
    T.title_id AS id,
    TT.name AS type,
    T.name AS title,
    T.is_adult,
    T.start_year,
    T.end_year,
    T.runtime_minutes AS duration,
    R.sum_of_votes / (R.total_votes * 2) AS rating,
    CASE
        WHEN COUNT(G.name) = 0 THEN NULL
        ELSE ARRAY_AGG(G.name)
    END AS genres
FROM titles T
LEFT JOIN title_types TT ON T.type_id = TT.type_id
LEFT JOIN ratings R ON T.title_id = R.title_id
LEFT JOIN genres_titles GT ON T.title_id = GT.title_id
LEFT JOIN genres G ON GT.genre_id = G.genre_id
WHERE 
    ($1::TEXT IS NULL OR T.name ILIKE '%' || $1 || '%')
    AND ($2::BOOLEAN IS NULL OR T.is_adult = $2)
GROUP BY
    T.title_id,
    TT.name,
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
