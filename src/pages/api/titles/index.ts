import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { getTitlesByPageQuery } from '@/db/queries/titles/getTitlesByPage'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.status(405).end() // Method Not Allowed
		return
	}

	try {
		const { search, isAdult , page, pageSize } = req.query

		const sanitizedSearch = search ? String(search) : null 
		const sanitizedIsAdult = isAdult ? Boolean(isAdult) : null
		const sanitizedPage = page && !isNaN(Number(page)) ? Math.max(1, Number(page)) : null
		const sanitizedPageSize = pageSize && !isNaN(Number(pageSize)) ? Math.max(1, Number(pageSize)) : 10

		const baseParams = [
			sanitizedPageSize, 
			sanitizedPage ? (sanitizedPage - 1) * sanitizedPageSize : 0
		]

		const { rows } = await pool.query(
			getTitlesByPageQuery,
			[
				sanitizedSearch,
				sanitizedIsAdult,
				...baseParams
			]
		)
		res.status(200).json(rows)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}