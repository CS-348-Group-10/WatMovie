export const getTitlesByPageQuery = 
`
SELECT * FROM titles
ORDER BY title_id
LIMIT $1
OFFSET $2;
`