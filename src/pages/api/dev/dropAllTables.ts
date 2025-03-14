import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { dropAllTablesQuery } from '@/db/queries/general/dropAllTables'

export default async function dropAllTables(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'DELETE') {
		res.status(405).end()
		return
	}

	let client: any
	try {
		client = await pool.connect()

		await client.query(dropAllTablesQuery)
        
		res.status(200).end()
	} catch (err) {
		console.error(err)
		res.status(500).end()
	} finally {
		client.release()
	}
}
