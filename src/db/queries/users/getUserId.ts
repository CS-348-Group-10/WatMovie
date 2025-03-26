export const getUserIdQuery =
`
SELECT uid
FROM users
WHERE email = $1
AND password = $2
`
