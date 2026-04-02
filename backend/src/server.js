const app = require("./app");
const { nodeEnv, port } = require("./config");
const { checkDatabaseConnection } = require("./db/pool");

function startListeningWithFallback(basePort) {
  const maxAttempts = nodeEnv === "production" ? 1 : 20;

  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryListen = () => {
      const candidatePort = basePort + attempt;
      const server = app.listen(candidatePort);

      server.once("listening", () => {
        process.stdout.write(`Backend listening on port ${candidatePort}\n`);
        resolve(server);
      });

      server.once("error", (error) => {
        server.close();

        if (error.code === "EADDRINUSE" && attempt + 1 < maxAttempts) {
          process.stderr.write(
            `Port ${candidatePort} is busy, trying ${candidatePort + 1}...\n`,
          );
          attempt += 1;
          tryListen();
          return;
        }

        reject(error);
      });
    };

    tryListen();
  });
}

async function bootstrap() {
  await checkDatabaseConnection();
  await startListeningWithFallback(port);
}

bootstrap().catch((error) => {
  process.stderr.write(`Startup failed: ${error.message}\n`);
  process.exit(1);
});
