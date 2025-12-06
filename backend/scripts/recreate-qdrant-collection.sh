#!/bin/bash

# Script to recreate Qdrant collection with correct dimension for Gemini embedding

echo "🔧 Recreating Qdrant collection for Gemini text-embedding-004 (768 dimensions)"

# Qdrant connection details
QDRANT_URL="${QDRANT_HOST:-localhost}"
QDRANT_PORT="${QDRANT_PORT:-6334}"
QDRANT_API_KEY="${QDRANT_API_KEY}"
COLLECTION_NAME="vaxsafe_knowledge"

# Full URL
if [ -n "$QDRANT_API_KEY" ]; then
  BASE_URL="https://${QDRANT_URL}:${QDRANT_PORT}"
  AUTH_HEADER="api-key: ${QDRANT_API_KEY}"
else
  BASE_URL="http://${QDRANT_URL}:${QDRANT_PORT}"
  AUTH_HEADER=""
fi

echo "📍 Qdrant URL: ${BASE_URL}"
echo "📦 Collection: ${COLLECTION_NAME}"

# Delete existing collection
echo "🗑️  Deleting existing collection..."
if [ -n "$AUTH_HEADER" ]; then
  curl -X DELETE "${BASE_URL}/collections/${COLLECTION_NAME}" \
    -H "${AUTH_HEADER}" \
    -H "Content-Type: application/json"
else
  curl -X DELETE "${BASE_URL}/collections/${COLLECTION_NAME}" \
    -H "Content-Type: application/json"
fi

echo ""
echo "⏳ Waiting 2 seconds..."
sleep 2

# Create new collection with 768 dimensions (Gemini text-embedding-004)
echo "✨ Creating new collection with 768 dimensions..."
if [ -n "$AUTH_HEADER" ]; then
  curl -X PUT "${BASE_URL}/collections/${COLLECTION_NAME}" \
    -H "${AUTH_HEADER}" \
    -H "Content-Type: application/json" \
    -d '{
      "vectors": {
        "size": 768,
        "distance": "Cosine"
      }
    }'
else
  curl -X PUT "${BASE_URL}/collections/${COLLECTION_NAME}" \
    -H "Content-Type: application/json" \
    -d '{
      "vectors": {
        "size": 768,
        "distance": "Cosine"
      }
    }'
fi

echo ""
echo "✅ Collection recreated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart the backend application"
echo "   2. Re-ingest knowledge base data"
echo "   3. Test RAG queries"
