export const insertMovieQuery = 
`
INSERT INTO movies 
    (
        mid,
        name,
        is_adult,
        release_year,
        runtime_minutes
    ) 
    VALUES 
    ($1, $2, $3, $4, $5)
`
