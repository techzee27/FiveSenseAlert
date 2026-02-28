import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "alerts.db");
const db = new Database(dbPath, { verbose: console.log });

db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        latitude TEXT,
        longitude TEXT,
        battery_level TEXT,
        battery_status TEXT,
        video_url TEXT
    )
`);

export default db;
