const { Pool } = require("pg");
const { databaseUrl, nodeEnv } = require("../config");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: nodeEnv === "production" ? { rejectUnauthorized: false } : undefined,
});

async function checkDatabaseConnection() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0];
}

module.exports = {
  pool,
  checkDatabaseConnection,
};
