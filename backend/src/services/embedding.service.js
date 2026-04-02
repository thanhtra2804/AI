const OpenAI = require("openai");
const {
  aiProvider,
  aiTimeoutMs,
  aiMaxRetries,
  aiRetryDelayMs,
  openAiApiKey,
  openAiEmbeddingModel,
  geminiApiKey,
} = require("../config");

const VECTOR_DIMENSION = 1536;

const openAiClient = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout(taskFactory, timeoutMs, label) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([taskFactory(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withRetry(taskFactory, label) {
  let lastError;

  for (let attempt = 0; attempt <= aiMaxRetries; attempt += 1) {
    try {
      return await withTimeout(taskFactory, aiTimeoutMs, label);
    } catch (error) {
      lastError = error;
      if (attempt >= aiMaxRetries) break;
      const backoff = aiRetryDelayMs * (attempt + 1);
      await sleep(backoff);
    }
  }

  throw lastError;
}

function normalizeVector(input) {
  const source = Array.isArray(input) ? input : [];
  if (source.length === VECTOR_DIMENSION) return source;

  if (source.length > VECTOR_DIMENSION) {
    return source.slice(0, VECTOR_DIMENSION);
  }

  const output = [...source];
  while (output.length < VECTOR_DIMENSION) output.push(0);
  return output;
}

function fallbackEmbedding(text) {
  const out = new Array(VECTOR_DIMENSION).fill(0);
  const str = String(text || "");
  for (let i = 0; i < str.length; i += 1) {
    const bucket = i % VECTOR_DIMENSION;
    out[bucket] += (str.charCodeAt(i) % 97) / 97;
  }
  return normalizeVector(out);
}

async function createEmbeddingWithOpenAi(text) {
  if (!openAiClient) throw new Error("OPENAI_API_KEY is missing");
  const response = await withRetry(
    () =>
      openAiClient.embeddings.create({
        model: openAiEmbeddingModel,
        input: text,
      }),
    "openai-embedding",
  );

  return normalizeVector(response.data?.[0]?.embedding || []);
}

async function createEmbeddingWithGemini(text) {
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY is missing");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent` +
    `?key=${geminiApiKey}`;

  const response = await withRetry(
    () =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: {
            parts: [{ text }],
          },
        }),
      }),
    "gemini-embedding",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini embedding failed: ${errorText}`);
  }

  const data = await response.json();
  const values = data?.embedding?.values || [];
  return normalizeVector(values);
}

async function createEmbedding(text) {
  try {
    if (aiProvider === "openai") {
      return await createEmbeddingWithOpenAi(text);
    }

    if (aiProvider === "gemini") {
      return await createEmbeddingWithGemini(text);
    }
  } catch (error) {
    process.stderr.write(`Embedding provider fallback: ${error.message}\n`);
  }

  return fallbackEmbedding(text);
}

function vectorToPg(vector) {
  return `[${vector.map((v) => Number(v).toFixed(8)).join(",")}]`;
}

module.exports = {
  VECTOR_DIMENSION,
  createEmbedding,
  vectorToPg,
};
