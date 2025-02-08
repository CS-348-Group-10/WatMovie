SELECT * FROM titles
WHERE 
    (name ILIKE '%' || 'code' || '%')
    AND (is_adult = false)
ORDER BY title_id
LIMIT 10
OFFSET 0;