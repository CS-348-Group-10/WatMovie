import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { NextApiRequest, NextApiResponse } from 'next'
import seedrandom from 'seedrandom'
import pool from '@/db'
import { getAllGenresQuery } from '@/db/queries/genres/getAllGenres'
import { insertGenreQuery } from '@/db/queries/genres/insertGenre'
import { insertGenreMovieQuery } from '@/db/queries/genresMovies/insertGenreMovie'
import { insertMovieCastQuery } from '@/db/queries/movieCast/insertMovieCast'
import { insertMovieProfessionalQuery } from '@/db/queries/movieProfessionals/insertMovieProfessional'
import { insertIMDBRatingQuery } from '@/db/queries/imdbRatings/insertIMDBRating'
import { getAllMovieRolesQuery } from '@/db/queries/movieRoles/getAllMovieRoles'
import { insertMovieRoleQuery } from '@/db/queries/movieRoles/insertMovieRole'
import { getAllMovieIdsQuery } from '@/db/queries/movies/getAllMovieIds'
import { insertMovieQuery } from '@/db/queries/movies/insertMovie'
import { insertUserQuery } from '@/db/queries/users/insertUser'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const USERS_CSV_FILE = path.join(process.cwd(), 'public', 'users.csv')
const USER_REVIEWS_CSV_FILE = path.join(process.cwd(), 'public', 'user_reviews.csv')
const TSV_TITLE_FILE = path.join(process.cwd(), 'public', 'title.tsv')
const TSV_RATINGS_FILE = path.join(process.cwd(), 'public', 'title.ratings.tsv')
const TSV_PRINCIPALS_FILE = path.join(process.cwd(), 'public', 'title.principals.tsv')
const TSV_NAME_FILE = path.join(process.cwd(), 'public', 'name.basics.tsv')

const PROD_BATCH_SIZE = 1000 // ONE_THOUSAND
const TEST_DATA_SIZE = 1000 // ONE_HUNDRED
const TSV_PARSER_OPTIONS = { separator: '\t', escape: '', quote: '' }
const CSV_PARSER_OPTIONS = { separator: ',', escape: '"', quote: '"' }

const generateUsersCSV = async () => {
	try {
		console.log('🚧 Running generate_users.py script...')
		const { stdout, stderr } = await execAsync('python scripts/generate_users.py')
		if (stderr) {
			console.error('Error running Python script:', stderr)
			throw new Error('Failed to generate users CSV')
		}
		console.log('✅ Successfully generated users.csv')
	} catch (error) {
		console.error('Error:', error)
		throw error
	}
}

const processUsersBatch = async (
	client: any,
	batchRecords: any[]
) => {
	try {
		await client.query('BEGIN')
		const insertedUids: number[] = []

		for (const record of batchRecords) {
			const result = await client.query(
				insertUserQuery,
				[
					record.first_name,
					record.last_name,
					record.email,
					record.password
				]
			)
			insertedUids.push(result.rows[0].uid)
		}
		
		await client.query('COMMIT')
		return insertedUids
	} catch (error) {
		await client.query('ROLLBACK')
		throw new Error('Users batch insert failed: ' + error)
	}
}

const populateUsers = async (client: any) => {
	try {
		// First generate the users.csv file
		await generateUsersCSV()

		console.log('🚧 Populating users table from users.csv')
		
		// Read all records first
		const records: any[] = []
		await new Promise<void>((resolve, reject) => {
			fs.createReadStream(USERS_CSV_FILE)
				.pipe(csv(CSV_PARSER_OPTIONS))
				.on('data', (row) => records.push(row))
				.on('end', resolve)
				.on('error', reject)
		})

		// Process records in batches
		const BATCH_SIZE = 100
		let processedCount = 0
		const userIds: number[] = []

		for (let i = 0; i < records.length; i += BATCH_SIZE) {
			const batch = records.slice(i, i + BATCH_SIZE)
			const batchUids = await processUsersBatch(client, batch)
			userIds.push(...batchUids)
			processedCount += batch.length

			if (processedCount % BATCH_SIZE === 0) {
				console.log(`Processed ${processedCount} user records`)
			}
		}

		console.log(`🚀 Successfully populated ${processedCount} users`)
		return userIds
	} catch (error) {
		throw new Error('Failed to populate users: ' + error)
	}
}

const buildGenreSet = async (): Promise<Set<string>> => {
	return new Promise((resolve, reject) => {
		const genresSet = new Set<string>()

		const readStream = fs.createReadStream(TSV_TITLE_FILE).pipe(csv(TSV_PARSER_OPTIONS))

		readStream.on('data', (row) => {
			if (row.genres && row.genres !== '\\N') {
				row.genres.split(',').forEach((genre: string) => {
					genresSet.add(genre)
				})
			}
		})
		readStream.on('end', () => resolve(genresSet))
		readStream.on('error', (error) => reject(error))
	})
}

const insertGenres = async (
	client: any, 
	genresSet: Set<string>
) => {
	try {
		for (const genre of genresSet) {
			await client.query(insertGenreQuery, [genre])
		}
	} catch (error) {
		throw new Error('Database insert failed [genre]')
	}
}

const getGenreMapping = async (client: any) => {
	const genreNameToIdMap = new Map<string, number>()

	try {
		const { rows: genreRows } = await client.query(getAllGenresQuery)
		genreRows.forEach((row: any) => {
			genreNameToIdMap.set(row.name, row.gid)
		})
	} catch (error) {
		throw new Error('Database select failed [genre]')
	}

	return genreNameToIdMap
}

const processMoviesBatch = async (
	client: any,
	batchRecords: any[],
	genreNameToIdMap: Map<string, number>
) => {
	try {
		await client.query('BEGIN')

		for (const record of batchRecords) {
			await client.query(
				insertMovieQuery,
				[
					record.tconst,
					record.primaryTitle,
					record.isAdult === '0' ? false : true,
					record.startYear,
					record.runtimeMinutes === '\\N' ? null : record.runtimeMinutes
				]
			)

			if (record.genres && record.genres !== '\\N') {
				for (const genre of record.genres.split(',')) {
					await client.query(
						insertGenreMovieQuery,
						[genreNameToIdMap.get(genre), record.tconst]
					)
				}
			}
		}
		
		await client.query('COMMIT')
	} catch (error) {
		await client.query('ROLLBACK')
		throw new Error('Batch insert failed' + error)
	}
}

const insertMovies = async (
	client: any,
	isProduction: boolean,
	genreNameToIdMap: Map<string, number>
) => {
	try {
		if (isProduction) {
			let batchRecords: any[] = []
			let lineCount = 0

			await new Promise<void>((resolve, reject) => {
				const readStream = fs.createReadStream(TSV_TITLE_FILE).pipe(csv({ separator: '\t', escape: '', quote: '' }))
				readStream.on('data', async (row) => {
					if (row.titleType !== 'movie' || row.startYear === '\\N') {
						return
					}

					lineCount++
					batchRecords.push(row)

					if (batchRecords.length === PROD_BATCH_SIZE) {
						readStream.pause()
						processMoviesBatch(client, batchRecords, genreNameToIdMap)
							.then(() => {
								batchRecords = []
								readStream.resume()
							})
							.catch((error) => {
								reject(error)
							})
					}

					if (lineCount % 100000 === 0) {
						console.log(`Processed ${lineCount} movie records`)
					}
				})

				readStream.on('end', async () => {
					if (batchRecords.length > 0) {
						try {
							await processMoviesBatch(client, batchRecords, genreNameToIdMap)
						} catch (error) {
							reject(error)
						}
					}
					resolve()
				})
				readStream.on('error', (error) => reject(error))
			})
		} else {
			const rng = seedrandom('2025')
			const selectedRecords: any[] = []
			const movieIds = new Set<string>()
			let lineCount = 0

			await new Promise<void>((resolve, reject) => {
				const readStream = fs.createReadStream(TSV_TITLE_FILE).pipe(csv(TSV_PARSER_OPTIONS))

				readStream.on('data', (row) => {
					if (row.titleType !== 'movie' || row.startYear === '\\N') {
						return
					}

					lineCount++
					if (selectedRecords.length < TEST_DATA_SIZE) {
						selectedRecords.push(row)
					} else {
						const randomIndex = Math.floor(rng() * lineCount)
						if (randomIndex < TEST_DATA_SIZE) {
							selectedRecords[randomIndex] = row
						}
					}
				})

				readStream.on('end', async () => {
					try {
						selectedRecords.forEach((record) => movieIds.add(record.tconst))
						await processMoviesBatch(client, selectedRecords, genreNameToIdMap)
						resolve()
					} catch (error) {
						reject(error)
					}
				})
				readStream.on('error', (error) => reject(error))
			})
			return { movieIds }
		}
		return { movieIds: null }
	} catch (error) {
		throw new Error('Database insert failed [movies]')
	}
}

const getMovieIdsSet = async () => {
	const movieIds = new Set<string>()

	try {
		const { rows: movieRows } = await pool.query(getAllMovieIdsQuery)
		movieRows.forEach((row: any) => {
			movieIds.add(row.mid)
		})
		return movieIds
	} catch (error) {
		throw new Error('Database select failed [movie ids]')
	}
}

const insertIMDBRatings = async (
	client: any,
	movieIds: Set<string> | null = null
) => {
	await client.query('BEGIN')

	const readStream = fs.createReadStream(TSV_RATINGS_FILE).pipe(csv(TSV_PARSER_OPTIONS))

	readStream.on('data', async (row) => {
		if (movieIds && !movieIds.has(row.tconst)) {
			return
		}

		await client.query(
			insertIMDBRatingQuery,
			[
				row.tconst,
				Number(row.averageRating) * Number(row.numVotes),
				Number(row.numVotes)
			]
		)
	})

	readStream.on('end', async () => {
		await client.query('COMMIT')
	})
	readStream.on('error', async (error) => {
		await client.query('ROLLBACK')
		throw new Error('Database insert failed [ratings]')
	})
}

const buildMovieRolesSet = async (): Promise<Set<string>> => {
	return new Promise((resolve, reject) => {
		const rolesSet = new Set<string>()

		const readStream = fs.createReadStream(TSV_PRINCIPALS_FILE).pipe(csv(TSV_PARSER_OPTIONS))
		
		readStream.on('data', async (row) => {
			rolesSet.add(row.category)
		})
		readStream.on('end', async () => {
			resolve(rolesSet)
		})
		readStream.on('error', async (error) => {
			reject(error)
		})
	})
}

const insertMovieRoles = async (
	client: any,
	rolesSet: Set<string>
) => {
	await client.query('BEGIN')

	for (const role of rolesSet) {
		await client.query(insertMovieRoleQuery, [role])
	}

	await client.query('COMMIT')
}

const getMovieRolesMapping = async (client: any) => {
	const roleToIdMap = new Map<string, number>()

	try {
		const { rows } = await client.query(getAllMovieRolesQuery)

		rows.forEach((row: any) => {
			roleToIdMap.set(row.name, row.rid)
		})

		return roleToIdMap
	} catch (error) {
		throw new Error('Database select failed [movie roles]')
	}
}

const getRelatedMovieProfessionalIds = async (
	movieIds: Set<string>
) => {
	return new Promise<Set<string>>((resolve, reject) => {
		const movieProfessionals = new Set<string>()

		const readStream = fs.createReadStream(TSV_PRINCIPALS_FILE).pipe(csv(TSV_PARSER_OPTIONS))

		readStream.on('data', (row) => {
			if (movieIds.has(row.tconst)) {
				movieProfessionals.add(row.nconst)
			}
		})

		readStream.on('end', () => {
			resolve(movieProfessionals)
		})

		readStream.on('error', (error) => {
			reject(error)
		})
	})
}

const processMovieProfessionalsBatch = async (
	client: any,
	batchRecords: any[],
) => {
	try {
		await client.query('BEGIN')

		for (const record of batchRecords) {
			await client.query(
				insertMovieProfessionalQuery,
				[
					record.nconst,
					record.primaryName
				]
			)
		}
		
		await client.query('COMMIT')
	} catch (error) {
		await client.query('ROLLBACK')
		throw new Error('Movie professionals batch insert failed' + error)
	}
}

const insertMovieProfessionals = async (
	client: any,
	movieProfessionalIds: Set<string>
) => {
	try {
		let batchRecords: any[] = []

		return new Promise<Set<string>>((resolve, reject) => {
			const readStream = fs.createReadStream(TSV_NAME_FILE).pipe(csv(TSV_PARSER_OPTIONS))

			readStream.on('data', async (row) => {
				if (!movieProfessionalIds.has(row.nconst)) {
					return
				}
		
				movieProfessionalIds.delete(row.nconst)
				
				batchRecords.push(row)

				if (batchRecords.length === PROD_BATCH_SIZE) {
					readStream.pause()
					processMovieProfessionalsBatch(client, batchRecords)
						.then(() => {
							batchRecords = []
							readStream.resume()
						})
						.catch((error) => {
							reject(error)
						})
				}
			})

			readStream.on('end', async () => {
				if (batchRecords.length > 0) {
					try {
						await processMovieProfessionalsBatch(client, batchRecords)
					} catch (error) {
						reject(error)
					}
				}
				resolve(movieProfessionalIds)
			})
			readStream.on('error', (error) => reject(error))
		})
	} catch (error) {
		throw new Error('Database insert failed [movie professionals]')
	}
}

const processMovieCastBatch = async (
	client: any,
	batchRecords: any[],
	roleToIdMap: Map<string, number>
) => {
	try {
		await client.query('BEGIN')

		for (const record of batchRecords) {
			await client.query(
				insertMovieCastQuery,
				[
					record.tconst,
					record.ordering,
					record.nconst,
					roleToIdMap.get(record.category),
					record.job === '\\N' ? null : record.job,
					record.characters === '\\N' ? null : record.characters
				]
			)
		}
		
		await client.query('COMMIT')
	} catch (error) {
		await client.query('ROLLBACK')
		throw new Error('Movie cast batch insert failed' + error)
	}
}

const insertMovieCast = async (
	client: any,
	roleToIdMap: Map<string, number>,
	movieIds: Set<string>,
	missingProfessionalIds: Set<string>
) => {
	try {
		let batchRecords: any[] = []

		await new Promise<void>((resolve, reject) => {
			const readStream= fs.createReadStream(TSV_PRINCIPALS_FILE).pipe(csv(TSV_PARSER_OPTIONS))

			readStream.on('data', async (row) => {
				if (!movieIds.has(row.tconst) || missingProfessionalIds.has(row.nconst)) {
					return
				}

				batchRecords.push(row)

				if (batchRecords.length === PROD_BATCH_SIZE) {
					readStream.pause()
					processMovieCastBatch(client, batchRecords, roleToIdMap)
						.then(() => {
							batchRecords = []
							readStream.resume()
						})
						.catch((error) => {
							reject(error)
						})
				}
			})

			readStream.on('end', async () => {
				if (batchRecords.length > 0) {
					try {
						await processMovieCastBatch(client, batchRecords, roleToIdMap)
					} catch (error) {
						reject(error)
					}
				}
				resolve()
			})	

			readStream.on('error', (error) => reject(error))
		})
	} catch (error) {
		throw new Error('Database insert failed [movie cast]')
	}
}

const generateUserReviewsCSV = async () => {
	try {
		console.log('🚧 Running generate_user_reviews.py script...')
		const { stdout, stderr } = await execAsync('python scripts/generate_user_reviews.py')
		if (stderr) {
			console.error('Error running Python script:', stderr)
			throw new Error('Failed to generate user reviews CSV')
		}
		console.log('✅ Successfully generated user_reviews.csv')
	} catch (error) {
		console.error('Error:', error)
		throw error
	}
}

const processUserReviewsBatch = async (client: any, batch: any[]) => {
	try {
		await client.query('BEGIN')

		const values = batch.map(record => 
			`(${record.uid}, '${record.mid}', ${record.rating}, '${record.comment.replace(/'/g, "''")}', '${record.created_at}', '${record.updated_at}')`
		).join(',')

		await client.query(`
			INSERT INTO user_reviews (uid, mid, rating, comment, created_at, updated_at)
			VALUES ${values}
				ON CONFLICT (uid, mid) DO NOTHING
		`)

		await client.query('COMMIT')
	} catch (error) {
		await client.query('ROLLBACK')
		throw new Error('User reviews batch insert failed' + error)
	}
}

const populateUserReviews = async (client: any) => {
	try {
		await generateUserReviewsCSV()

		console.log('🚧 Populating user reviews table from user_reviews.csv')
		
		// Read all records first
		const records: any[] = []
		await new Promise<void>((resolve, reject) => {
			fs.createReadStream(USER_REVIEWS_CSV_FILE)
				.pipe(csv(CSV_PARSER_OPTIONS))
				.on('data', (row) => records.push(row))
				.on('end', resolve)
				.on('error', reject)
		})

		// Process records in batches of 10,000
		const BATCH_SIZE = 10000
		let processedCount = 0

		for (let i = 0; i < records.length; i += BATCH_SIZE) {
			const batch = records.slice(i, i + BATCH_SIZE)
			await processUserReviewsBatch(client, batch)
			processedCount += batch.length

			if (processedCount % BATCH_SIZE === 0) {
				console.log(`Processed ${processedCount} user reviews`)
			}
		}

		console.log(`✅ Successfully inserted ${processedCount} user reviews`)
	} catch (error) {
		throw new Error('Failed to populate user reviews: ' + error)
	}
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Only POST method is allowed' })
	}

	const isProduction = req.query.isProduction === 'true'

	if (!isProduction) {
		console.log('🚧 Development mode: Populating database with sample data')
	} else {
		console.log('🚧 Production mode: Populating database with full data')
	}
  
	let client: any = null
	try {
		client = await pool.connect()

		const genresSet = await buildGenreSet()

		await insertGenres(client, genresSet)
		console.log('🚀 genres populated')

		const genreNameToIdMap = await getGenreMapping(client)

		await insertMovies(client, isProduction, genreNameToIdMap)
		console.log('🚀 movies populated')

		const movieIds = await getMovieIdsSet()

		await insertIMDBRatings(client, movieIds)
		console.log('🚀 imdb_ratings populated')

		const roleSet = await buildMovieRolesSet()
		await insertMovieRoles(client, roleSet)
		console.log('🚀 movie_roles populated')

		const movieProfessionalIds = await getRelatedMovieProfessionalIds(movieIds)
		const missingProfessionalIds = await insertMovieProfessionals(client, movieProfessionalIds)
		console.log('🚀 movie_professionals populated')

		const roleToIdMap = await getMovieRolesMapping(client)
		await insertMovieCast(client, roleToIdMap, movieIds, missingProfessionalIds)
		console.log('🚀 movie_cast populated')

		// Populate users and user reviews
		await populateUsers(client)
		console.log(`🚀 users populated`)

		await populateUserReviews(client)
		console.log(`🚀 user_reviews populated`)

		res.status(200).json({ message: 'Database populated successfully' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error processing the request', details: error })
	} finally {
		if (client) {
			client.release()
		}
	}
}
