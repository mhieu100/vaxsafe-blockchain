# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies and node-prune
RUN apk add --no-cache curl bash && \
    curl -sfL https://gobinaries.com/tj/node-prune | sh

COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --ignore-scripts

# Run node-prune to remove unnecessary files from node_modules
RUN node-prune

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY . .

EXPOSE 4000

CMD ["npm", "start"]
