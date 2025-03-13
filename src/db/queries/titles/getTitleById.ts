export const getTitleByIdQuery =
`
SELECT
    T.title_id,
    T.type_id,
    T.name as title,
    T.is_adult,
    T.start_year,
    T.end_year,
    T.runtime_minutes AS duration,
    R.sum_of_votes / R.total_votes AS rating,
    CASE
        WHEN COUNT(GT.genre_id) = 0 THEN NULL
        ELSE ARRAY_AGG(GT.genre_id)
    END AS genre_ids,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'id', PT.member_id,
            'name', PM.primary_name,
            'ordering', PT.ordering,
            'category_id', PT.category_id,
            'job', PT.job,
            'characters', PT.characters
        ))
        FROM production_team PT
        LEFT JOIN production_members PM ON PT.member_id = PM.member_id
        WHERE PT.title_id = T.title_id
    ) AS cast
FROM titles T
LEFT JOIN ratings R ON T.title_id = R.title_id
LEFT JOIN genres_titles GT ON T.title_id = GT.title_id
WHERE T.title_id = $1
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
`
