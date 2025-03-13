import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { getTitleByIdQuery } from '@/db/queries/titles/getTitleById'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.status(405).end()
		return
	}

	const { id } = req.query

	// Check if the id is a string and matches the format tt\d{7}
	if (typeof id !== 'string' || !/^tt\d{7}$/.test(id)) {
		res.status(400).json({ message: 'Invalid title ID' })
		return
	}

	try {
		const { rows } = await pool.query(
			getTitleByIdQuery,
			[id]
		)

		res.status(200).json(rows[0])
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}
