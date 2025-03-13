import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { buildGetTitlesByPageQuery } from '@/db/queries/titles/getTitlesByPage'
import { SortOrder, SortType } from '@/types'

const parseIds = (query: string | string[] | undefined): number[] | null => {
	try {
		if (typeof query === 'string') {
			return query.split(',').map(Number)
		}
	} catch (err) {
		console.error(err)
	}

	return null
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.status(405).end() // Method Not Allowed
		return
	}

	try {
		const { 
			typeIds, 
			searchQuery, 
			isAdult,
			startYear,
			endYear,
			minDuration,
			maxDuration,
			minRating,
			maxRating,
			genreIds,
			pageSize,
			page, 
			sortType,
			sortOrder
		} = req.query

		const sanitizedTypeIds = parseIds(typeIds)
		const sanitizedSearchQuery = searchQuery ? String(searchQuery) : null 
		const sanitizedIsAdult = isAdult ? Boolean(isAdult) : null
		const sanitizedStartYear = startYear && !isNaN(Number(startYear)) ? Number(startYear) : null
		const sanitizedEndYear = endYear && !isNaN(Number(endYear)) ? Number(endYear) : null
		const sanitizedMinDuration = minDuration && !isNaN(Number(minDuration)) ? Number(minDuration) : null
		const sanitizedMaxDuration = maxDuration && !isNaN(Number(maxDuration)) ? Number(maxDuration) : null
		const sanitizedMinRating = minRating && !isNaN(Number(minRating)) ? Number(minRating) : null
		const sanitizedMaxRating = maxRating && !isNaN(Number(maxRating)) ? Number(maxRating) : null
		const sanitizedGenreIds = parseIds(genreIds)
		const sanitizedPageSize = pageSize && !isNaN(Number(pageSize)) ? Math.max(1, Number(pageSize)) : 10
		const sanitizedPage = page && !isNaN(Number(page)) ? Math.max(1, Number(page)) : null
		const sanitizedSortType = (sortType && Object.values(SortType).includes(sortType as SortType)) ? sortType as SortType : null
		const sanitizedSortOrder = (sortOrder && Object.values(SortOrder).includes(sortOrder as SortOrder)) ? sortOrder as SortOrder : SortOrder.ASC

		const baseParams = [
			sanitizedTypeIds,
			sanitizedSearchQuery,
			sanitizedIsAdult,
			sanitizedStartYear,
			sanitizedEndYear,
			sanitizedMinDuration,
			sanitizedMaxDuration,
			sanitizedMinRating,
			sanitizedMaxRating,
			sanitizedGenreIds,
			sanitizedPageSize, 
			sanitizedPage ? (sanitizedPage - 1) * sanitizedPageSize : 0
		]

		const { rows } = await pool.query(
			buildGetTitlesByPageQuery(sanitizedSortType, sanitizedSortOrder),
			baseParams
		)
		res.status(200).json(rows)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}
