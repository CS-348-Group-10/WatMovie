export const getWatchlistMovieIdsQuery =
`
SELECT mid AS id
FROM watchlists
WHERE watchlists.uid = $1
`
