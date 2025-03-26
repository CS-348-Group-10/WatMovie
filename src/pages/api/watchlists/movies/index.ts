import pool from "@/db"
import { getWatchlistMoviesQuery } from "@/db/queries/watchlists/getWatchlistMovies"
import { NextApiRequest, NextApiResponse } from "next"


export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        const { userId } = req.query

        if (!userId) {
            res.status(400).json({ message: 'Missing user id' })
            return
        }

        try {
            const { rows } = await pool.query(
                getWatchlistMoviesQuery, 
                [
                    userId
                ]
            )

            res.status(200).json(rows)
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Something went wrong' })
        }
    }
}