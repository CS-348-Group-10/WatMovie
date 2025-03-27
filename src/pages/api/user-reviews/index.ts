import pool from "@/db";
import { deleteUserReviewQuery } from "@/db/queries/userReviews/deleteUserReview";
import { getUserReviewsQuery } from "@/db/queries/userReviews/getUserReviews";
import { insertUserReviewQuery } from "@/db/queries/userReviews/insertUserReview";
import { updateUserReviewQuery } from "@/db/queries/userReviews/updateUserReview";
import { NextApiRequest, NextApiResponse } from "next";

const convertRowToUserReview = (row: any) => ({
    userId: row.uid,
    firstName: row.first_name,
    lastName: row.last_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at
})

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        const { movieId } = req.query

        if (!movieId || typeof movieId !== 'string') {
            res.status(400).end() // Bad Request
            return
        }

        try {
            const { rows } = await pool.query(
                getUserReviewsQuery,
                [movieId]
            )

            res.status(200).json(rows.map(row => convertRowToUserReview(row)))
        } catch (err) {
            console.error(err)
            res.status(400).end() // Bad Request
        }
    } else if (req.method === 'POST') {
        const { userId, movieId, rating, comment } = req.body

        if (!userId || !movieId || !rating) {
            res.status(400).end() // Bad Request
            return
        }

        try {
            const { rows } = await pool.query(
                insertUserReviewQuery,
                [userId, movieId, rating, comment]
            )

            res.status(201).json(rows.map(row => convertRowToUserReview(row))[0])
        } catch (err) {
            console.error(err)
            res.status(400).end() // Bad Request
        }
    } else if (req.method === 'PUT') {
        const { userId, movieId, rating, comment } = req.body

        if (!userId || !movieId || !rating) {
            res.status(400).end() // Bad Request
            return
        }

        
        try {
            const { rows } = await pool.query(
                updateUserReviewQuery,
                [userId, movieId, rating, comment]
            )

            res.status(200).json(rows.map(row => convertRowToUserReview(row))[0])
        } catch (err) {
            console.error(err)
            res.status(400).end() // Bad Request
        }
    } else if (req.method === 'DELETE') {
        const { userId, movieId } = req.body

        if (!userId || !movieId) {
            res.status(400).end() // Bad Request
            return
        }

        try {
            await pool.query(
                deleteUserReviewQuery,
                [userId, movieId]
            )

            res.status(204).end() // No Content
        } catch (err) {
            console.error(err)
            res.status(400).end() // Bad Request
        }
    }

    res.status(405).end() // Method Not Allowed
}