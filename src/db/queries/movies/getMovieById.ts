export const getMovieByIdQuery =
`
SELECT
    M.mid as id,
    M.name as movie,
    M.is_adult,
    M.release_year,
    M.runtime_minutes AS duration,
    MR.sum_of_votes / MR.total_votes AS rating,
    MR.total_votes AS votes,
    CASE
        WHEN COUNT(GM.gid) = 0 THEN NULL
        ELSE ARRAY_AGG(GM.gid)
    END AS genre_ids,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'id', MC.pid,
            'name', MP.primary_name,
            'ordering', MC.ordering,
            'role_id', MC.rid,
            'job', MC.job,
            'characters', MC.characters
        ))
        FROM movie_cast MC
        LEFT JOIN movie_professionals MP ON MC.pid = MP.pid
        WHERE MC.mid = M.mid
    ) AS cast
FROM movies M
LEFT JOIN imdb_ratings MR ON M.mid = MR.mid
LEFT JOIN genres_movies GM ON M.mid = GM.mid
WHERE m.mid = $1
GROUP BY
    M.mid,
    M.name,
    M.is_adult,
    M.release_year,
    M.runtime_minutes,
    MR.sum_of_votes,
    MR.total_votes
`
