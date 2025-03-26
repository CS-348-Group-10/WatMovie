import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { getRandomMovieQuery } from '@/db/queries/titles/getRandomMovie'

export default async function handler(
	req: NextApiRequest, 
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.status(405).end()
		return
	}

	try {
		const { rows } = await pool.query(getRandomMovieQuery)
		res.status(200).json(rows[0])
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Something went wrong' })
	}
}
