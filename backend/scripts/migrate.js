const { runMigrations } = require("../src/db/migrate");
const { pool } = require("../src/db/pool");

async function main() {
  await runMigrations();
  process.stdout.write("Migrations completed.\n");
}

main()
  .catch((error) => {
    process.stderr.write(`Migration failed: ${error.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
