const { query } = require("../src/db/query");
const { pool } = require("../src/db/pool");

async function main() {
  const extension = await query(
    "SELECT extname FROM pg_extension WHERE extname = 'vector'",
  );
  const tables = await query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'documents', 'chat_history', 'exercises') ORDER BY table_name",
  );
  const now = await query("SELECT now() AS server_time");

  process.stdout.write(`vector extension: ${extension.rowCount > 0}\n`);
  process.stdout.write(
    `tables: ${tables.rows.map((row) => row.table_name).join(", ")}\n`,
  );
  process.stdout.write(`server_time: ${now.rows[0].server_time}\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`Smoke failed: ${error.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
