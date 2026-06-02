import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(
  process.cwd(),
  "data",
  "parking.db"
)
console.log("DATABASE:", dbPath)
declare global {
  var sqlite: Database.Database | undefined
}

const db =
  global.sqlite ||
  new Database(dbPath)

if (process.env.NODE_ENV !== "production") {
  global.sqlite = db
}

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user'
)
`)

export default db