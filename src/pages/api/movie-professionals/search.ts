import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/db';
import { searchMovieProfessionalQuery } from '@/db/queries/movieProfessionals/searchMovieProfessional';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.query;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Name parameter is required' });
    }

    try {
        const result = await pool.query(
            searchMovieProfessionalQuery,
            [`%${name}%`]
        );
        
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error searching professionals:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 
