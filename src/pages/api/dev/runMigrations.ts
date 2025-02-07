import { NextApiRequest, NextApiResponse } from 'next'
import runMigrations from '../../../db/migrate'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		void runMigrations()
		res.status(200).json({ message: 'Running migrations...' })
	} else {
		res.status(405).json({ message: 'Method Not Allowed' })
	}
}
