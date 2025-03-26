import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { getAllGenresQuery } from '@/db/queries/genres/getAllGenres'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.status(405).end()
		return
	}

	try {
		const { rows } = await pool.query(getAllGenresQuery)

		const genres = rows.map((genre) => {
			return {
				id: genre.gid,
				name: genre.name,
			}
		})

		res.status(200).json(genres)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}
