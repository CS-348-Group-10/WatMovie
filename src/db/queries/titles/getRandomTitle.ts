export const getRandomTitleQuery =
`
SELECT * FROM titles
WHERE type_id = 2
ORDER BY RANDOM()
LIMIT 1;
`
