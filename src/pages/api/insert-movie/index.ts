import { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/db'
import { insertMovieByUserQuery } from '@/db/queries/movies/insertMovieByUser'
import { insertIMDBRatingQuery } from '@/db/queries/imdbRatings/insertIMDBRating'
import { insertGenreMovieQuery } from '@/db/queries/genresMovies/insertGenreMovie'
import { insertMovieCastQuery } from '@/db/queries/movieCast/insertMovieCast'
// import { Cast } from '../../../types'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
        res.status(405).end()
        return
    }

    const movie = req.body
    console.log(movie)

    try {
        await pool.query('BEGIN')
        await pool.query(
            insertMovieByUserQuery,
            [
                movie.id,
                movie.name,
                movie.is_adult,
                movie.release_year,
                movie.duration,
                0,
                0,
            ]
        )
        for (let i = 0; i < movie.genre_ids.length; i++) {
            await pool.query(insertGenreMovieQuery, 
                [
                    movie.genre_ids[i],
                    movie.id
                ]
            )
        }
        await pool.query(insertIMDBRatingQuery, 
            [
                movie.id,
                movie.sum_of_votes,
                movie.total_votes
            ]
        )
        // for (let i = 0; i < movie.cast.length; i++) {
        //     await pool.query(insertMovieCastQuery, 
        //         [
        //             movie.id,
        //             movie.cast[i].ordering,
        //             movie.cast[i].id,
        //             movie.cast[i].role_id,
        //             movie.cast[i].job,
        //             movie.cast[i].characters
        //         ]
        //     )
        // }
        await pool.query('COMMIT')
        res.status(200).json({ message: 'Movie inserted successfully' })
    } catch (err) {
        await pool.query('ROLLBACK')
        console.error(err)
        res.status(500).json({ message: 'Something went wrong' })
    }

}
