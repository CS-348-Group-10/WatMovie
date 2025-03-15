SELECT * 
FROM watchlists
LEFT JOIN titles ON watchlists.title_id = titles.title_id
WHERE watchlists.user_id = 8;
