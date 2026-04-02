const { randomUUID } = require("crypto");
const { query } = require("../db/query");
const { createEmbedding, vectorToPg } = require("./embedding.service");

function chunkText(text, chunkSize = 800, overlap = 120) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const slice = clean.slice(start, end).trim();
    if (slice) chunks.push(slice);
    if (end >= clean.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

async function ingestDocument({ text, metadata = {} }) {
  const traceId = randomUUID();
  const chunks = chunkText(text);
  const documentIds = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const content = chunks[i];
    const embedding = await createEmbedding(content);
    const vectorLiteral = vectorToPg(embedding);

    const result = await query(
      `INSERT INTO documents(content, embedding, metadata)
       VALUES ($1, $2::vector, $3::jsonb)
       RETURNING id`,
      [
        content,
        vectorLiteral,
        JSON.stringify({ ...metadata, trace_id: traceId, chunk_index: i }),
      ]
    );

    documentIds.push(result.rows[0].id);
  }

  return {
    trace_id: traceId,
    inserted_count: documentIds.length,
    chunk_count: chunks.length,
    document_ids: documentIds,
  };
}

async function retrieveRelevantDocs(question, limit = 5) {
  const embedding = await createEmbedding(question);
  const vectorLiteral = vectorToPg(embedding);

  const result = await query(
    `SELECT id, content, metadata, embedding <-> $1::vector AS score
     FROM documents
     ORDER BY embedding <-> $1::vector
     LIMIT $2`,
    [vectorLiteral, limit]
  );

  return result.rows.map((row) => ({
    document_id: row.id,
    content: row.content,
    metadata: row.metadata,
    score: Number(row.score),
  }));
}

module.exports = {
  chunkText,
  ingestDocument,
  retrieveRelevantDocs,
};
