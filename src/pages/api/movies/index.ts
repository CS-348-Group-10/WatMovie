import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { buildGetMoviesByPageQuery } from '@/db/queries/movies/getMoviesByPage'
import { SortOrder, SortType } from '@/types'
import { getMovieCountQuery } from '@/db/queries/movies/getMovieCount'

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

const parseBoolean = (query: string | string[] | undefined): boolean | null => {
	if (typeof query === 'string') {
		const lowerCaseQuery = query.toLowerCase()
		if (lowerCaseQuery === 'true') {
			return true
		}
		if (lowerCaseQuery === 'false') {
			return false
		}
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
			searchQuery, 
			isAdult,
			releaseYear,
			minDuration,
			maxDuration,
			minRating,
			maxRating,
			minVotes,
			genreIds,
			pageSize,
			page, 
			sortType,
			sortOrder
		} = req.query

		if (!pageSize || isNaN(Number(pageSize)) || Number(pageSize) < 1) {
			res.status(400).json({ message: 'pageSize is required' })
			return
		}

		const sanitizedSearchQuery = searchQuery ? String(searchQuery) : null 
		const sanitizedIsAdult = parseBoolean(isAdult)
		const sanitizedStartYear = releaseYear && !isNaN(Number(releaseYear)) ? Number(releaseYear) : null
		const sanitizedEndYear = releaseYear && !isNaN(Number(releaseYear)) ? Number(releaseYear) : null
		const sanitizedMinDuration = minDuration && !isNaN(Number(minDuration)) ? Number(minDuration) : null
		const sanitizedMaxDuration = maxDuration && !isNaN(Number(maxDuration)) ? Number(maxDuration) : null
		const sanitizedMinRating = minRating && !isNaN(Number(minRating)) ? Number(minRating) : null
		const sanitizedMaxRating = maxRating && !isNaN(Number(maxRating)) ? Number(maxRating) : null
		const sanitizedMinVotes = minVotes && !isNaN(Number(minVotes)) ? Number(minVotes) : null
		const sanitizedGenreIds = parseIds(genreIds)
		const sanitizedPageSize = Number(pageSize)
		const sanitizedPage = page && !isNaN(Number(page)) ? Math.max(1, Number(page)) : null
		const sanitizedSortType = (sortType && Object.values(SortType).includes(sortType as SortType)) ? sortType as SortType : null
		const sanitizedSortOrder = (sortOrder && Object.values(SortOrder).includes(sortOrder as SortOrder)) ? sortOrder as SortOrder : SortOrder.ASC

		const baseParams = [
			sanitizedSearchQuery,
			sanitizedIsAdult,
			sanitizedStartYear,
			sanitizedEndYear,
			sanitizedMinDuration,
			sanitizedMaxDuration,
			sanitizedMinRating,
			sanitizedMaxRating,
			sanitizedMinVotes,
			sanitizedGenreIds
		]
		
		const [
			{ rows: countRows },
			{ rows: movieRows } 
		] = await Promise.all([
			pool.query(getMovieCountQuery,baseParams),
			pool.query(
				buildGetMoviesByPageQuery(sanitizedSortType, sanitizedSortOrder),
				[
					...baseParams,
					sanitizedPageSize, 
					sanitizedPage ? (sanitizedPage - 1) * sanitizedPageSize : 0
				]
			)
		])

		const total_pages = Math.ceil(Math.max(Number(countRows[0].total), 1) / sanitizedPageSize)

		res.status(200).json(movieRows.map(movieRow => ({
			...movieRow,
			total_pages
		})))
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}
