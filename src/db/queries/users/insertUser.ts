export const insertUserQuery =
`
INSERT INTO users (
    user_id,
    name,
    email
) VALUES (
    $1,
    $2,
    $3
)
`
