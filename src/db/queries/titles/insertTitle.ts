export const insertTitleQuery = 
`
INSERT INTO titles 
    (
        title_id, 
        type_id, 
        name, 
        is_adult, 
        start_year, 
        end_year, 
        runtime_minutes
    ) 
    VALUES 
    ($1, $2, $3, $4, $5, $6, $7)
`
