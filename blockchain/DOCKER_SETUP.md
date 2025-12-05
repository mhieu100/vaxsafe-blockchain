# Docker Compose Configuration

## Files

- `docker-compose.yml` - Base production configuration
- `docker-compose.override.yml` - Local development overrides (auto-loaded)
- `docker-compose.dev.yml` - Alternative explicit dev config
- `docker-compose.prod.yml` - Alternative explicit prod config

## Usage

### Development (Recommended - auto hot reload)
```bash
docker compose up -d
```
Docker Compose automatically merges `docker-compose.yml` + `docker-compose.override.yml`

### Production (CI/CD)
```bash
docker compose -f docker-compose.yml up -d
```
Ignores override file, uses only base config

### Alternative: Explicit files
```bash
# Dev
docker compose -f docker-compose.dev.yml up -d

# Prod
docker compose -f docker-compose.prod.yml up -d
```

## Key Differences

### Development (with override)
- Mounts `./src` for hot reload
- Changes to source code are reflected immediately
- No need to rebuild image
- **Auto-loaded** by `docker compose` command

### Production (CI/CD)
- Only mounts `./build` (contract artifacts)
- Uses code baked into Docker image
- More stable and predictable
- Override file ignored with `-f docker-compose.yml`

## CI/CD Workflow

The GitHub Actions workflow uses:
```bash
docker compose -f docker-compose.yml up -d
```

This ensures:
1. **Code changes** → Push to GitHub
2. **CI builds** new Docker image with updated code
3. **Push image** to Docker Hub
4. **Production pulls** latest image: `docker compose pull`
5. **Restart with base config**: `docker compose -f docker-compose.yml up -d`
6. **No source mount** → Uses code from image only

## Contract Updates

If smart contracts change:
1. Rebuild contracts: `npm run deploy` or `truffle compile`
2. New JSON files in `./build/contracts/`
3. Both dev and prod will pick up changes (mounted volume)

## .gitignore

Add to `.gitignore` if you want different local overrides:
```
docker-compose.override.yml
```

But currently committed so team shares same dev setup.
