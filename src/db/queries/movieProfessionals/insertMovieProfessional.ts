export const insertMovieProfessionalQuery = 
`
INSERT INTO movie_professionals (pid, primary_name)
VALUES ($1, $2)
`