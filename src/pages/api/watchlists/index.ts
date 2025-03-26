import pool from "@/db";
import { deleteWatchlistQuery } from "@/db/queries/watchlists/deleteWatchlist";
import { getWatchlistMovieIdsQuery } from "@/db/queries/watchlists/getWatchlistMovieIds";
import { insertWatchlistQuery } from "@/db/queries/watchlists/insertWatchlist";
import { NextApiRequest, NextApiResponse } from "next";


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
                getWatchlistMovieIdsQuery, 
                [
                    userId
                ]
            )

            res.status(200).json(rows.map(({ id }) => id))
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Something went wrong' })
        }
    } else if (req.method === 'POST') {
        const { userId, movieId } = req.body

        if (!userId || !movieId) {
            res.status(400).json({ message: 'Missing user id or movie id' })
            return
        }

        try {
            await pool.query(
                insertWatchlistQuery, 
                [
                    userId, 
                    movieId
                ]
            )

            res.status(201).end()
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Something went wrong' })
        }
    } else if (req.method === 'DELETE') {
        const { userId, movieId } = req.body

        if (!userId || !movieId) {
            res.status(400).json({ message: 'Missing user id or movie id' })
            return
        }

        try {
            await pool.query(
                deleteWatchlistQuery, 
                [
                    userId, 
                    movieId
                ]
            )

            res.status(204).end()
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Something went wrong' })
        }
    }

    res.status(405).end()
}
    