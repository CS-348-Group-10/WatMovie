SELECT
    uid, 
    first_name,
    last_name,
    rating,
    comment,
    created_at,
    updated_at
FROM user_reviews
NATURAL JOIN users
WHERE mid = 'tt2990738';
