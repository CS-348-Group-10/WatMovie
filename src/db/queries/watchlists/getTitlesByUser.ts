export const getWatchlistByUserQuery =
`
SELECT * 
FROM watchlists
LEFT JOIN movies ON watchlists.mid = movies.mid
WHERE watchlists.uid = $1
`
