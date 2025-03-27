export const getWatchlistMoviesQuery =
`
SELECT 
    M.mid AS id,
    M.name AS movie,
    M.is_adult,
    M.release_year,
    M.runtime_minutes AS duration,
    MR.sum_of_votes / MR.total_votes AS rating,
    MR.total_votes AS votes,
    CASE
        WHEN COUNT(GM.gid) = 0 THEN NULL
        ELSE ARRAY_AGG(GM.gid)
    END AS genre_ids
FROM movies M
INNER JOIN watchlists W ON M.mid = W.mid
LEFT JOIN imdb_ratings MR ON M.mid = MR.mid
LEFT JOIN genres_movies GM ON M.mid = GM.mid
WHERE 
    W.uid = $1
GROUP BY 
    M.mid, 
    MR.sum_of_votes, 
    MR.total_votes
`