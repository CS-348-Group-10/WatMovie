export const getRandomMovieQuery =
`
SELECT * FROM movies
ORDER BY RANDOM()
LIMIT 1;
`
