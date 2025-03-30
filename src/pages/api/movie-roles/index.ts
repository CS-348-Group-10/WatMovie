import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { getAllMovieRolesQuery } from '@/db/queries/movieRoles/getAllMovieRoles'

export default async function handler(
	req: NextApiRequest, 
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.status(405).end()
		return
	}

	try {
		const { rows } = await pool.query(getAllMovieRolesQuery)

		const memberCategories = rows.map((row) => {
			return {
				id: row.rid,
				name: row.name,
			}
		})

		res.status(200).json(memberCategories)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}
