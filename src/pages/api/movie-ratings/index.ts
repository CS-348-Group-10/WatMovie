import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/db';
import { getMovieUserRatingsQuery } from '@/db/queries/movies/getMovieUserRatings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid movie ID' });
    }

    try {
        // Use the existing SQL query to get hourly ratings with 6-hour moving average
        const { rows: ratings } = await pool.query(getMovieUserRatingsQuery, [id]);

        // Transform the data to match the expected format
        const formattedRatings = ratings.map(rating => ({
            date: rating.rating_hour.toISOString(),
            rating: parseFloat(rating.six_hour_moving_avg)
        }));

        return res.status(200).json(formattedRatings);
    } catch (error) {
        console.error('Error fetching movie ratings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 