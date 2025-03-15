export const insertWatchlistQuery =
`
INSERT INTO watchlists (
    user_id,
    title_id
) VALUES (
    $1,
    $2
)
`
