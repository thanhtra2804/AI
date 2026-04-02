const fs = require("fs");
const path = require("path");
const { pool } = require("./pool");

async function runSeeds() {
  const seedsDir = path.join(__dirname, "seeds");
  const files = fs
    .readdirSync(seedsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const fullPath = path.join(seedsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8");
    process.stdout.write(`Running seed: ${file}\n`);
    await pool.query(sql);
  }
}

module.exports = {
  runSeeds,
};
