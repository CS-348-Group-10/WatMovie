export const searchMovieProfessionalQuery = 
`
SELECT (pid, primary_name) 
FROM movie_professionals
WHERE LOWER(primary_name) LIKE LOWER($1)
ORDER BY primary_name
LIMIT 10
`
