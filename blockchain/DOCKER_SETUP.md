# Docker Compose Configuration

## Files

- `docker-compose.yml` - Base configuration (production-ready)
- `docker-compose.dev.yml` - Development with source code hot reload
- `docker-compose.prod.yml` - Production (explicit, same as base)

## Usage

### Development (with hot reload)
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Production (from Docker Hub image)
```bash
docker compose up -d
# or explicitly:
docker compose -f docker-compose.prod.yml up -d
```

## Key Differences

### Development
- Mounts `./src` for hot reload
- Changes to source code are reflected immediately
- No need to rebuild image

### Production
- Only mounts `./build` (contract artifacts)
- Uses code baked into Docker image
- More stable and predictable

## CI/CD Workflow

1. **Code changes** → Push to GitHub
2. **CI builds** new Docker image with updated code
3. **Push image** to Docker Hub with tag
4. **Production pulls** latest image and restarts
5. **No source mount** → Uses code from image

## Contract Updates

If smart contracts change:
1. Rebuild contracts: `npm run deploy` or `truffle compile`
2. New JSON files in `./build/contracts/`
3. Both dev and prod will pick up changes (mounted volume)
