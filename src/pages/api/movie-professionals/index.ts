import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/db';
import { getAllMovieProfessionalsQuery } from '@/db/queries/movieProfessionals/getAllMovieProfessionals';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { rows } = await pool.query(getAllMovieProfessionalsQuery);

        const memberCategories = rows.map((row) => {
			return {
				id: row.pid,
				name: row.primary_name,
			}
		})
        
        return res.status(200).json(memberCategories);
    } catch (error) {
        console.error('Error fetching movie professionals:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 
