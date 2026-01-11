import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "compliance.db");
const SCHEMA_PATH = path.join(process.cwd(), "schema.sql");

const db = new Database(DB_PATH);
const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
db.exec(schema);

export default db;
