export const searchMovieProfessionalQuery = 
`
SELECT *
FROM movie_professionals
WHERE LOWER(primary_name) LIKE LOWER($1)
ORDER BY primary_name
LIMIT 10
`
