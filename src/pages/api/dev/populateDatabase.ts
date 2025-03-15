import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { NextApiRequest, NextApiResponse } from 'next'
import seedrandom from 'seedrandom'
import pool from '@/db'
import { getAllGenresQuery } from '@/db/queries/genres/getAllGenres'
import { insertGenreQuery } from '@/db/queries/genres/insertGenre'
import { insertGenreTitleQuery } from '@/db/queries/genresTitles/insertGenreTitle'
import { getAllMemberCategoriesQuery } from '@/db/queries/memberCategories/getAllMemberCategories'
import { insertMemberCategoryQuery } from '@/db/queries/memberCategories/insertMemberCategory'
import { insertProductionMemberQuery } from '@/db/queries/productionMembers/insertProductionMember'
import { insertProductionTeamQuery } from '@/db/queries/productionTeam/insertProductionTeamQuery'
import { insertRatingQuery } from '@/db/queries/ratings/insertRatings'
import { insertTitleQuery } from '@/db/queries/titles/insertTitle'
import { getAllTitleTypesQuery } from '@/db/queries/titleTypes/getAllTitleTypes'
import { insertTitleTypeQuery } from '@/db/queries/titleTypes/insertTitleType'
import { insertUserQuery } from '@/db/queries/users/insertUser'
import { insertWatchlistQuery } from '@/db/queries/watchlists/insertWatchlist'
import { insertUserReviewQuery } from '@/db/queries/userReviews/insertUserReview'

const TSV_TITLE_FILE = path.join(process.cwd(), 'public', 'title.tsv')
const TSV_RATINGS_FILE = path.join(process.cwd(), 'public', 'title.ratings.tsv')
const TSV_PRINCIPALS_FILE = path.join(process.cwd(), 'public', 'title.principals.tsv')
const TSV_NAME_FILE = path.join(process.cwd(), 'public', 'name.basics.tsv')

const PROD_BATCH_SIZE = 1000 // ONE_THOUSAND
const TEST_DATA_SIZE = 100 // ONE_HUNDRED
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
						console.log(`Processed ${lineCount} title records`)
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

const buildMemberCategorySet = async (): Promise<Set<string>> => {
	return new Promise((resolve, reject) => {
		const categorySet = new Set<string>()

		const readStream = fs.createReadStream(TSV_PRINCIPALS_FILE).pipe(csv(TSV_PARSER_OPTIONS))
		
		readStream.on('data', async (row) => {
			categorySet.add(row.category)
		})
		readStream.on('end', async () => {
			resolve(categorySet)
		})
		readStream.on('error', async (error) => {
			reject(error)
		})
	})
}

const insertMemberCategories = async (
	client: any,
	categorySet: Set<string>
) => {
	await client.query('BEGIN')

	for (const category of categorySet) {
		await client.query(insertMemberCategoryQuery, [category])
	}

	await client.query('COMMIT')
}

const getMemberCategoryMapping = async (client: any) => {
	const categoryToIdMap = new Map<string, number>()

	try {
		const { rows } = await client.query(getAllMemberCategoriesQuery)

		rows.forEach((row: any) => {
			categoryToIdMap.set(row.name, row.category_id)
		})

		return categoryToIdMap
	} catch (error) {
		throw new Error('Database select failed [member categories]')
	}
}

const getRelatedProductionMemberIds = async (
	titleIds: Set<string>
) => {
	return new Promise<Set<string>>((resolve, reject) => {
		const productionMembers = new Set<string>()

		const readStream = fs.createReadStream(TSV_PRINCIPALS_FILE).pipe(csv(TSV_PARSER_OPTIONS))

		readStream.on('data', (row) => {
			if (titleIds.has(row.tconst)) {
				productionMembers.add(row.nconst)
			}
		})

		readStream.on('end', () => {
			resolve(productionMembers)
		})

		readStream.on('error', (error) => {
			reject(error)
		})
	})
}

const processMembersBatch = async (
	client: any,
	batchRecords: any[],
) => {
	try {
		await client.query('BEGIN')

		for (const record of batchRecords) {
			await client.query(
				insertProductionMemberQuery,
				[
					record.nconst,
					record.primaryName
				]
			)
		}
		
		await client.query('COMMIT')
	} catch (error) {
		await client.query('ROLLBACK')
		throw new Error('Member batch insert failed' + error)
	}
}

const insertProductionMembers = async (
	client: any,
	productionMemberIds: Set<string> | null = null
) => {
	try {
		let batchRecords: any[] = []

		await new Promise<void>((resolve, reject) => {
			const readStream = fs.createReadStream(TSV_NAME_FILE).pipe(csv(TSV_PARSER_OPTIONS))

			readStream.on('data', async (row) => {
				if (productionMemberIds && !productionMemberIds.has(row.nconst)) {
					return
				}
				
				batchRecords.push(row)

				if (batchRecords.length === PROD_BATCH_SIZE) {
					readStream.pause()
					processMembersBatch(client, batchRecords)
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
						await processMembersBatch(client, batchRecords)
					} catch (error) {
						reject(error)
					}
				}
				resolve()
			})
			readStream.on('error', (error) => reject(error))
		})
	} catch (error) {
		throw new Error('Database insert failed [production members]')
	}
}

const processProductionTeamBatch = async (
	client: any,
	batchRecords: any[],
	categoryToIdMap: Map<string, number>
) => {
	try {
		await client.query('BEGIN')

		for (const record of batchRecords) {
			await client.query(
				insertProductionTeamQuery,
				[
					record.tconst,
					record.ordering,
					record.nconst,
					categoryToIdMap.get(record.category),
					record.job === '\\N' ? null : record.job,
					record.characters === '\\N' ? null : record.characters
				]
			)
		}
		
		await client.query('COMMIT')
	} catch (error) {
		await client.query('ROLLBACK')
		throw new Error('Production team batch insert failed' + error)
	}
}

const insertProductionTeam = async (
	client: any,
	categoryToIdMap: Map<string, number>,
	titleIds: Set<string> | null = null
) => {
	try {
		let batchRecords: any[] = []

		await new Promise<void>((resolve, reject) => {
			const readStream= fs.createReadStream(TSV_PRINCIPALS_FILE).pipe(csv(TSV_PARSER_OPTIONS))

			readStream.on('data', async (row) => {
				if (titleIds && !titleIds.has(row.tconst)) {
					return
				}

				batchRecords.push(row)

				if (batchRecords.length === PROD_BATCH_SIZE) {
					readStream.pause()
					processProductionTeamBatch(client, batchRecords, categoryToIdMap)
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
						await processProductionTeamBatch(client, batchRecords, categoryToIdMap)
					} catch (error) {
						reject(error)
					}
				}
				resolve()
			})	

			readStream.on('error', (error) => reject(error))
		})
	} catch (error) {
		throw new Error('Database insert failed [production team]')
	}
}

const insertUserAndRelatedDate = async (
	client: any,
	titleIds: Set<string> | null = null
) => {
	try {
		await client.query('BEGIN')

		for (let i = 0; i < 100; i++) {
			await client.query(
				insertUserQuery,
				[
					i, 
					`Person ${i}`,
					`email${i}@abc.com`
				]
			)
		}

		const rng = seedrandom('2025')

		if (!titleIds) {
			titleIds = new Set<string>()
			for (let i = 0; i < 100; i++) {
				const randomNum = Math.floor(rng() * 10000000) // 0 to 9999999
				const randomTitleId = `tt${randomNum.toString().padStart(7, '0')}`
				titleIds.add(randomTitleId)
			}
		}

		const titleIdsArray = Array.from(titleIds)

		for (let i = 0; i < 100; i++) {
			const numWatchlist = Math.floor(rng() * 6) // generates 0 to 5 watchlist entries per user
			// Create a copy of titleIdsArray to ensure unique titleIds for this user's watchlist
			const availableTitleIds = [...titleIdsArray]
			for (let j = 0; j < numWatchlist; j++) {
				const randomIndex = Math.floor(rng() * availableTitleIds.length)
				const randomTitleId = availableTitleIds.splice(randomIndex, 1)[0]
				await client.query(
					insertWatchlistQuery,
					[
						i, 
						randomTitleId
					]
				)
			}
		}

		// Insert review entries with a random titleId (unique per user) and a random rating between 1 and 10,
		// with up to 5 reviews per user
		for (let i = 0; i < 100; i++) {
			const numReviews = Math.floor(rng() * 6) // generates 0 to 5 reviews per user
			// Create a copy of titleIdsArray to ensure unique titleIds for this user's reviews
			const availableTitleIds = [...titleIdsArray]
			for (let j = 0; j < numReviews; j++) {
				const randomIndex = Math.floor(rng() * availableTitleIds.length)
				const randomTitleId = availableTitleIds.splice(randomIndex, 1)[0]
				const randomRating = Math.floor(rng() * 10) + 1 // random rating between 1 and 10
				await client.query(
					insertUserReviewQuery,
					[
						i,                    // user id or review id depending on design
						randomTitleId,
						randomRating,
						`Great movie! ${i} review ${j}`  // review content (adjust as needed)
					]
				)
			}
		}

		await client.query('COMMIT')
	} catch (error) {
		await client.query('ROLLBACK')
		throw new Error('Database insert failed [users]')
	}
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
		console.log('🚀 genres and title_types populated')

		const { genreNameToIdMap, titleTypeToIdMap } = await getGenreAndTitleTypeMapping(client)
		const { titleIds } = await insertTitles(client, isProduction, genreNameToIdMap, titleTypeToIdMap)
		console.log('🚀 titles populated')

		await insertUserAndRelatedDate(client, titleIds)
		console.log('🚀 users, watchlists, and reviews populated')

		await insertRatings(client, titleIds)
		console.log('🚀 ratings populated')

		const categorySet = await buildMemberCategorySet()
		await insertMemberCategories(client, categorySet)
		console.log('🚀 member_categories populated')

		const productionMemberIds = titleIds ? await getRelatedProductionMemberIds(titleIds) : null
		await insertProductionMembers(client, productionMemberIds)
		console.log('🚀 production_members populated')

		const categoryToIdMap = await getMemberCategoryMapping(client)
		await insertProductionTeam(client, categoryToIdMap, titleIds)
		console.log('🚀 production_team populated')
	
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
