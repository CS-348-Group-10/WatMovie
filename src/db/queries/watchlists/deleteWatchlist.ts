export const deleteWatchlistQuery =
`
DELETE FROM watchlists WHERE uid = $1 AND mid = $2
`