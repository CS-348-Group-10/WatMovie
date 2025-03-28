import { SortType } from "@/types"
import { getSortingNotNullCondition } from "./getMoviesByPage"

export const buildGetMovieCountQuery = (sortBy: SortType | null) => `
SELECT 
    COUNT(DISTINCT M.mid) AS total
FROM movies M
LEFT JOIN imdb_ratings MR ON M.mid = MR.mid
LEFT JOIN genres_movies GM ON M.mid = GM.mid
WHERE 
    ($1::TEXT IS NULL OR (M.name ILIKE '%' || $1 || '%'))
    AND ($2::BOOLEAN IS NULL OR M.is_adult = $2)
    AND ($3::INTEGER IS NULL OR M.release_year >= $3)
    AND ($4::INTEGER IS NULL OR M.release_year <= $4)
    AND ($5::INTEGER IS NULL OR M.runtime_minutes >= $5)
    AND ($6::INTEGER IS NULL OR M.runtime_minutes <= $6)
    AND ($7::NUMERIC IS NULL OR (MR.sum_of_votes / MR.total_votes >= $7))
    AND ($8::NUMERIC IS NULL OR (MR.sum_of_votes / MR.total_votes <= $8))
    AND ($9::INTEGER IS NULL OR MR.total_votes >= $9)
    AND ($10::INTEGER[] IS NULL OR GM.gid = ANY($10))
    ${getSortingNotNullCondition(sortBy)}
`
