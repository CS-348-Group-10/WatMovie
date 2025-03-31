export const getMoviesByPageQuery = () => {
    return 'SELECT * FROM get_movies_by_page($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)'
}
