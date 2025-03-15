SELECT name, review, rating
FROM user_review as t1 
NATURAL JOIN users t2
WHERE title_id = 'tt17528314';