-- Drop all existing indexes (pgvector doesn't support >2000 dimensions for any index)
DROP INDEX IF EXISTS vector_store_embedding_idx;
DROP INDEX IF EXISTS spring_ai_vector_index;

-- Alter vector dimension to 3072
ALTER TABLE vector_store ALTER COLUMN embedding TYPE vector(3072);

-- Note: Cannot create index for vectors >2000 dimensions
-- Queries will use sequential scan (slower but functional)
-- Consider using dimension reduction if performance is critical

