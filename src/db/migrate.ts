import pool from './index'
import fs from 'fs'
import path from 'path'

const runMigrations = async () => {
  const client = await pool.connect()
  try {
    console.log("🚀 Running Migrations...")

    const migrationDir = path.join(process.cwd(), "src/db/migrations")
    const migrationFiles = fs.readdirSync(migrationDir).sort()

    for (const file of migrationFiles) {
      const filePath = path.join(migrationDir, file)
      const sql = fs.readFileSync(filePath, "utf-8")
      console.log(`📄 Running migration: ${file}`)
      await client.query(sql)
    }

    console.log("✅ Migrations completed!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    client.release()
  }
};

export default runMigrations
