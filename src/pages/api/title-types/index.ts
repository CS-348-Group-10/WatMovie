import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { getAllTitleTypesQuery } from '@/db/queries/titleTypes/getAllTitleTypes'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.status(405).end()
		return
	}

	try {
		const { rows } = await pool.query(getAllTitleTypesQuery)

		const titleTypes = rows.map((titleType) => {
			return {
				id: titleType.type_id,
				name: titleType.name,
			}
		})

		res.status(200).json(titleTypes)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}
