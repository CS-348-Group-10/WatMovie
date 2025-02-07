export const getRandomTitleQuery =
`
SELECT * FROM titles
ORDER BY RANDOM()
LIMIT 1;
`
