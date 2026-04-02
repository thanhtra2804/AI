const dotenv = require("dotenv");

dotenv.config();

const requiredVars = ["DATABASE_URL"];

for (const envName of requiredVars) {
  if (!process.env[envName]) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }
}

module.exports = {
  port: Number(process.env.PORT || 8080),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  corsOriginWhitelist: String(process.env.CORS_ORIGIN_WHITELIST || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitChatMax: Number(process.env.RATE_LIMIT_CHAT_MAX || 40),
  rateLimitExerciseMax: Number(process.env.RATE_LIMIT_EXERCISE_MAX || 30),
  rateLimitUploadMax: Number(process.env.RATE_LIMIT_UPLOAD_MAX || 20),
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 12000),
  aiMaxRetries: Number(process.env.AI_MAX_RETRIES || 2),
  aiRetryDelayMs: Number(process.env.AI_RETRY_DELAY_MS || 350),
  aiProvider: (process.env.AI_PROVIDER || "openai").toLowerCase(),
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openAiEmbeddingModel:
    process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
};
