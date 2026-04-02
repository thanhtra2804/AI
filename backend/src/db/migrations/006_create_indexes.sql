CREATE INDEX IF NOT EXISTS idx_documents_embedding
  ON documents USING ivfflat (embedding vector_l2_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_created
  ON chat_history (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_metadata
  ON documents USING GIN (metadata);
