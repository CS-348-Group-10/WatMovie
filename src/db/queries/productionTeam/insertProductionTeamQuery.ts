export const insertProductionTeamQuery = 
`
INSERT INTO production_team (title_id, ordering, member_id, category_id, job, characters)
VALUES ($1, $2, $3, $4, $5, $6)
`
