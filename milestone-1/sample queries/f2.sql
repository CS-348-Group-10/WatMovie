SELECT * FROM titles
WHERE 
    ($1::TEXT IS NULL OR name ILIKE '%' || $1 || '%')
    AND ($2::BOOLEAN IS NULL OR is_adult = $2)
ORDER BY title_id
LIMIT $3
OFFSET $4;