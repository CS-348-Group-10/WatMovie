import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { NextApiRequest, NextApiResponse } from 'next'
import seedrandom from 'seedrandom'
import pool from '@/db'
import { getAllGenresQuery } from '@/db/queries/genres/getAllGenres'
import { insertGenreQuery } from '@/db/queries/genres/insertGenre'
import { insertGenreTitleQuery } from '@/db/queries/genresTitles/insertGenreTitle'
import { insertRatingQuery } from '@/db/queries/ratings/insertRatings'
import { insertTitleQuery } from '@/db/queries/titles/insertTitle'
import { getAllTitleTypesQuery } from '@/db/queries/titleTypes/getAllTitleTypes'
import { insertTitleTypeQuery } from '@/db/queries/titleTypes/insertTitleType'

const TSV_TITLE_FILE = path.join(process.cwd(), 'public', 'title.tsv')
const TSV_RATINGS_FILE = path.join(process.cwd(), 'public', 'title.ratings.tsv')

const PROD_BATCH_SIZE = 1000 // ONE_THOUSAND
const TEST_DATA_SIZE = 10000 // TEN_THOUSAND
const TSV_PARSER_OPTIONS = { separator: '\t', escape: '', quote: '' }

const buildGenreAndTypeSets = async (): Promise<{ 
	genresSet: Set<string>, 
	typeSet: Set<string> 
}> => {
	return new Promise((resolve, reject) => {
		const genresSet = new Set<string>()
		const typeSet = new Set<string>()

		const readStream = fs.createReadStream(TSV_TITLE_FILE).pipe(csv(TSV_PARSER_OPTIONS))

		readStream.on('data', (row) => {
			if (row.genres && row.genres !== '\\N') {
				row.genres.split(',').forEach((genre: string) => {
					genresSet.add(genre)
				})
			}

			if (row.titleType && row.titleType !== '\\N') {
				typeSet.add(row.titleType)
			}
		})
		readStream.on('end', () => resolve({ genresSet, typeSet }))
		readStream.on('error', (error) => reject(error))
	})
}

const insertGenresAndTypes = async (
	client: any, 
	genresSet: Set<string>, 
	typeSet: Set<string>
) => {
	try {
		for (const genre of genresSet) {
			await client.query(insertGenreQuery, [genre])
		}
		
		for (const type of typeSet) {
			await client.query(insertTitleTypeQuery, [type])
		}
	} catch (error) {
		throw new Error('Database insert failed [genre and title type]')
	}
}

const getGenreAndTitleTypeMapping = async (client: any) => {
	const genreNameToIdMap = new Map<string, number>()
	const titleTypeToIdMap = new Map<string, number>()

	try {
		const { rows: genreRows } = await client.query(getAllGenresQuery)
		genreRows.forEach((row: any) => {
			genreNameToIdMap.set(row.name, row.genre_id)
		})
		
		const { rows: titleTypeRows } = await client.query(getAllTitleTypesQuery)
		titleTypeRows.forEach((row: any) => {
			titleTypeToIdMap.set(row.name, row.type_id)
		})
	} catch (error) {
		throw new Error('Database select failed [genre and title type]')
	}

	return { genreNameToIdMap, titleTypeToIdMap }
}

const processTitlesBatch = async (
	client: any,
	batchRecords: any[],
	genreNameToIdMap: Map<string, number>,
	titleTypeToIdMap: Map<string, number>
) => {
	try {
		await client.query('BEGIN')

		for (const record of batchRecords) {
			await client.query(
				insertTitleQuery,
				[
					record.tconst,
					record.titleType === '\\N' ? null : titleTypeToIdMap.get(record.titleType),
					record.primaryTitle,
					record.isAdult === '0' ? false : true,
					record.startYear === '\\N' ? null : record.startYear,
					record.endYear === '\\N' ? null : record.endYear,
					record.runtimeMinutes === '\\N' ? null : record.runtimeMinutes
				]
			)

			if (record.genres && record.genres !== '\\N') {
				for (const genre of record.genres.split(',')) {
					await client.query(
						insertGenreTitleQuery,
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

const insertTitles = async (
	client: any,
	isProduction: boolean,
	genreNameToIdMap: Map<string, number>,
	titleTypeToIdMap: Map<string, number>
) => {
	try {
		if (isProduction) {
			let batchRecords: any[] = []
			let lineCount = 0

			await new Promise<void>((resolve, reject) => {
				const readStream = fs.createReadStream(TSV_TITLE_FILE).pipe(csv({ separator: '\t', escape: '', quote: '' }))
				readStream.on('data', async (row) => {
					lineCount++
					batchRecords.push(row)

					if (batchRecords.length === PROD_BATCH_SIZE) {
						readStream.pause()
						processTitlesBatch(client, batchRecords, genreNameToIdMap, titleTypeToIdMap)
							.then(() => {
								batchRecords = []
								readStream.resume()
							})
							.catch((error) => {
								reject(error)
							})
					}

					if (lineCount % 100000 === 0) {
						console.log(`Processed ${lineCount} records`)
					}
				})

				readStream.on('end', async () => {
					if (batchRecords.length > 0) {
						try {
							await processTitlesBatch(client, batchRecords, genreNameToIdMap, titleTypeToIdMap)
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
			const titleIds = new Set<string>()
			let lineCount = 0

			await new Promise<void>((resolve, reject) => {
				const readStream = fs.createReadStream(TSV_TITLE_FILE).pipe(csv(TSV_PARSER_OPTIONS))

				readStream.on('data', (row) => {
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
						selectedRecords.forEach((record) => titleIds.add(record.tconst))
						await processTitlesBatch(client, selectedRecords, genreNameToIdMap, titleTypeToIdMap)
						resolve()
					} catch (error) {
						reject(error)
					}
				})
				readStream.on('error', (error) => reject(error))
			})
			return { titleIds }
		}
		return { titleIds: null }
	} catch (error) {
		throw new Error('Database insert failed [titles]')
	}
}

const insertRatings = async (
	client: any,
	titleIds: Set<string> | null = null
) => {
	await client.query('BEGIN')

	const readStream = fs.createReadStream(TSV_RATINGS_FILE).pipe(csv(TSV_PARSER_OPTIONS))

	readStream.on('data', async (row) => {
		if (titleIds && !titleIds.has(row.tconst)) {
			return
		}

		await client.query(
			insertRatingQuery,
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


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Only POST method is allowed' })
	}

	const isProduction = req.query.isProduction === 'true'
  
	let client: any = null
	try {
		// Build genre and type sets
		const { genresSet, typeSet } = await buildGenreAndTypeSets()

		client = await pool.connect()

		await insertGenresAndTypes(client, genresSet, typeSet)
		console.log('🚀 Genres and Title Types inserted')

		const { genreNameToIdMap, titleTypeToIdMap } = await getGenreAndTitleTypeMapping(client)
		const { titleIds } = await insertTitles(client, isProduction, genreNameToIdMap, titleTypeToIdMap)
		console.log('🚀 Titles inserted successfully')

		await insertRatings(client, titleIds)
		console.log('🚀 Ratings inserted successfully')
	
		res.status(200).json({ message: 'TSV records inserted successfully' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error processing the request', details: error })
	} finally {
		if (client) {
			client.release()
		}
	}
}
