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
    R.sum_of_votes / R.total_votes AS rating,
    CASE
        WHEN COUNT(GT.genre_id) = 0 THEN NULL
        ELSE ARRAY_AGG(GT.genre_id)
    END AS genres
FROM titles T
LEFT JOIN ratings R ON T.title_id = R.title_id
LEFT JOIN genres_titles GT ON T.title_id = GT.title_id
WHERE 
    ($1::INTEGER[] IS NULL OR T.type_id = ANY($1))
    AND ($2::TEXT IS NULL OR (T.name ILIKE '%' || $2 || '%'))
    AND ($3::BOOLEAN IS NULL OR T.is_adult = $3)
    AND ($4::INTEGER IS NULL OR T.start_year >= $4)
    AND ($5::INTEGER IS NULL OR T.end_year <= $5)
    AND ($6::INTEGER IS NULL OR T.runtime_minutes >= $6)
    AND ($7::INTEGER IS NULL OR T.runtime_minutes <= $7)
    AND ($8::INTEGER IS NULL OR (R.sum_of_votes / R.total_votes >= $8))
    AND ($9::INTEGER IS NULL OR (R.sum_of_votes / R.total_votes <= $9))
    AND ($10::INTEGER[] IS NULL OR GT.genre_id = ANY($10))
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
LIMIT $11
OFFSET $12;
`
