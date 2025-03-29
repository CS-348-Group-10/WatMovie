import pool from "@/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { rows } = await pool.query('SELECT * FROM top_10_movies');
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching top 10 movies:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
} 