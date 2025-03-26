import { SortOrder, SortType } from '@/types'

const getSortingNotNullCondition = (sortBy: SortType | null) => {
	switch (sortBy) {
	case SortType.RATING:
		return 'AND MR.sum_of_votes IS NOT NULL AND MR.total_votes IS NOT NULL'
	case SortType.RUNTIME:
		return 'AND M.runtime_minutes IS NOT NULL'
	default:
		return ''
	}
}

export const buildGetMoviesByPageQuery = (sortBy: SortType | null, order: SortOrder) => {
	const descTitleId = 'M.mid DESC'
	let orderBy = ''

	switch (sortBy) {
	case SortType.RATING:
		orderBy = `rating ${order}, ${descTitleId}`
		break
	case SortType.TITLE:
		orderBy = `M.name ${order}, ${descTitleId}`
		break
	case SortType.YEAR:
		orderBy = `M.release_year ${order}, ${descTitleId}`
		break
	case SortType.RUNTIME:
		orderBy = `M.runtime_minutes ${order}, ${descTitleId}`
		break
	default:
		orderBy = descTitleId
		break
	}

	return `
SELECT 
    M.mid AS id,
    M.name AS movie,
    M.is_adult,
    M.release_year,
    M.runtime_minutes AS duration,
    MR.sum_of_votes / MR.total_votes AS rating,
    MR.total_votes AS votes,
    CASE
        WHEN COUNT(GM.gid) = 0 THEN NULL
        ELSE ARRAY_AGG(GM.gid)
    END AS genre_ids
FROM movies M
LEFT JOIN movie_ratings MR ON M.mid = MR.mid
LEFT JOIN genres_movies GM ON M.mid = GM.mid
WHERE 
    ($1::TEXT IS NULL OR (M.name ILIKE '%' || $1 || '%'))
    AND ($2::BOOLEAN IS NULL OR M.is_adult = $2)
    AND ($3::INTEGER IS NULL OR M.release_year >= $3)
    AND ($4::INTEGER IS NULL OR M.release_year <= $4)
    AND ($5::INTEGER IS NULL OR M.runtime_minutes >= $5)
    AND ($7::INTEGER IS NULL OR M.runtime_minutes <= $6)
    AND ($7::INTEGER IS NULL OR (MR.sum_of_votes / MR.total_votes >= $7))
    AND ($8::INTEGER IS NULL OR (MR.sum_of_votes / MR.total_votes <= $8))
    AND ($9::INTEGER IS NULL OR MR.total_votes >= $9)
    AND ($10::INTEGER[] IS NULL OR GM.gid = ANY($10))
    ${getSortingNotNullCondition(sortBy)}
GROUP BY
    M.mid,
    M.name,
    M.is_adult,
    M.release_year,
    M.runtime_minutes,
    MR.sum_of_votes,
    MR.total_votes
ORDER BY ${orderBy}
LIMIT $11
OFFSET $12;
`
}
