import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { getUserIdQuery } from '@/db/queries/users/getUserId'
import { insertUserQuery } from '@/db/queries/users/insertUser'


export default async function handler(
	req: NextApiRequest, 
	res: NextApiResponse
) {
	if (req.method === 'GET') {
		try {
			const { email, password } = req.query

			if (!email || !password) {
				res.status(400).json({ message: 'Missing email or password' })
				return
			}

			const { rows } = await pool.query(
				getUserIdQuery, 
				[
					email, 
					password
				]
			)

			if (rows.length === 0) {
				res.status(401).json({ message: 'Invalid email or password' })
				return
			}

			res.status(200).json({ id: rows[0].uid })
		} catch (err) {
			console.error(err)
			res.status(500).json({ message: 'Something went wrong' })
		}
	} else if (req.method === 'POST') {
		try {
			const { first_name, last_name, email, password } = req.body

			if (!first_name || !email || !password) {
				res.status(400).json({ message: 'Missing required fields' })
				return
			}

			const { rows } = await pool.query(
				insertUserQuery, 
				[
					first_name, 
					!!last_name ? last_name : null, 
					email, 
					password
				]
			)
			
			res.status(201).json({ id: rows[0].uid })
		} catch (err) {
			console.error(err)
			res.status(500).json({ message: 'Something went wrong' })
		}
	}

	res.status(405).end()
}

