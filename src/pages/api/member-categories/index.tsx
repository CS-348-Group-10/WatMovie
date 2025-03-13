import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { getAllMemberCategoriesQuery } from '@/db/queries/memberCategories/getAllMemberCategories'

export default async function handler(
	req: NextApiRequest, 
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.status(405).end()
		return
	}

	try {
		const { rows } = await pool.query(getAllMemberCategoriesQuery)

		const memberCategories = rows.map((row) => {
			return {
				id: row.category_id,
				name: row.name,
			}
		})

		res.status(200).json(memberCategories)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}
