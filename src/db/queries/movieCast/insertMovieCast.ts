export const insertMovieCastQuery = 
`
INSERT INTO movie_cast (mid, ordering, pid, rid, job, characters)
VALUES ($1, $2, $3, $4, $5, $6)
`
