import path from "path"
import fs from "fs"
import csv from "csv-parser"
import { NextApiRequest, NextApiResponse } from "next"
import seedrandom from "seedrandom"
import pool from "@/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST method is allowed" })
    }
  
    try {
        const filePath = path.join(process.cwd(), "public", "title.tsv") // Replace with actual upload logic
        const rng = seedrandom('2025')  // Create a seeded random number generator

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const selectedRecords: any[] = []

        const sampleSize = 500
        let lineCount = 0
        const typeSet = new Set<string>()
        const genresSet = new Set<string>()
  
        // Open the file stream
        const readStream = fs.createReadStream(filePath).pipe(csv({ separator: "\t" }))
      
        readStream.on("data", (row) => {
            lineCount++

            if (lineCount <= 1000000) { 
                if (row.genres && row.genres !== "\\N") {
                    row.genres.split(",").forEach((genre: string) => {
                        genresSet.add(genre)
                    })
                }

                if (row.titleType && row.titleType !== "\\N") {
                    typeSet.add(row.titleType)
                }
                
                // Reservoir sampling: If fewer than sampleSize, just add the record
                if (selectedRecords.length < sampleSize) {
                    selectedRecords.push(row)
                } else {
                    // Otherwise, replace a random record with a new one
                    const randomIndex = Math.floor(rng() * lineCount)
                    if (randomIndex < sampleSize) {
                        selectedRecords[randomIndex] = row
                    }
                }
            }
        })
  
        readStream.on("end", async () => {
            if (selectedRecords.length === 0) {
                return res.status(400).json({ error: "TSV file is empty or no records selected" })
            }
  
            const client = await pool.connect()

            try {
                for (const genre of genresSet) {
                    await client.query(
                        "INSERT INTO genres (name) VALUES ($1)",
                        [genre]
                    )
                }
            } catch (error) {
                res.status(500).json({ error: "Database insert failed [genre]", details: error })
                return
            }

            try {
                for (const type of typeSet) {
                    await client.query(
                        "INSERT INTO title_types (name) VALUES ($1)",
                        [type]
                    )
                }
            } catch (error) {
                res.status(500).json({ error: "Database insert failed [title type]", details: error })
                return
            }

            const genreNameToIdMap = new Map<string, number>()

            try {
                const { rows } = await client.query("SELECT * FROM genres")
                rows.forEach((row) => {
                    genreNameToIdMap.set(row.name, row.genre_id)
                })
            } catch (error) {
                res.status(500).json({ error: "Database select failed", details: error })
                return
            }

            const titleTypeToIdMap = new Map<string, number>()

            try {
                const { rows } = await client.query("SELECT * FROM title_types")
                rows.forEach((row) => {
                    titleTypeToIdMap.set(row.name, row.type_id)
                })
            } catch (error) {
                res.status(500).json({ error: "Database select failed", details: error })
                return
            }
            
            try {
                await client.query("BEGIN")
        
                for (const record of selectedRecords) {
                    await client.query(
                        "INSERT INTO titles (title_id, type_id, name, is_adult, start_year, end_year, runtime_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                        [
                            record.tconst, 
                            record.titleType === "\\N" ? null : titleTypeToIdMap.get(record.titleType), 
                            record.primaryTitle, 
                            record.isAdult === "0" ? false : true,
                            record.startYear === "\\N" ? null : record.startYear,
                            record.endYear === "\\N" ? null : record.endYear, 
                            record.runtimeMinutes === "\\N" ? null : record.runtimeMinutes
                        ]
                    )
                    
                    if (!record.genres || record.genres === "\\N") {
                        continue
                    }

                    for (const genre of record.genres.split(",")) {
                        await client.query(
                            "INSERT INTO genres_titles (genre_id, title_id) VALUES ($1, $2)",
                            [genreNameToIdMap.get(genre), record.tconst]
                        )
                    }
                }
    
                await client.query("COMMIT")
                res.status(200).json({ message: "500 random records successfully inserted!" })
            } catch (error) {
                await client.query("ROLLBACK")
                res.status(500).json({ error: "Database insert failed", details: error })
            } finally {
                client.release()
            }
        })
  
        readStream.on("error", (error) => {
            res.status(500).json({ error: "File reading error", details: error })
        })
  
    } catch (error) {
        res.status(500).json({ error: "Error processing the request", details: error })
    }
}
