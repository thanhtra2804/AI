const fs = require("fs");
const path = require("path");
const { pool } = require("./pool");

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8");
    process.stdout.write(`Running migration: ${file}\n`);
    await pool.query(sql);
  }
}

module.exports = {
  runMigrations,
};
