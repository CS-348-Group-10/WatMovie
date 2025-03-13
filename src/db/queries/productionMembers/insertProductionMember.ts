export const insertProductionMemberQuery = 
`
INSERT INTO production_members (member_id, primary_name)
VALUES ($1, $2)
`