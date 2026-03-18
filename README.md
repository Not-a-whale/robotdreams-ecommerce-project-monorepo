# 🛒 Ecommerce Shop Project

Monorepo with NestJS backend, Next.js frontend, PostgreSQL, RabbitMQ, and S3 file uploads.

## 🚀 Quick Start

### Development Mode (Hot Reload)

```bash
# Start all services with hot reload
docker compose -f compose.yml -f compose.dev.yml up --build

# API: http://localhost:3000
# Frontend: http://localhost:3001
# RabbitMQ UI: http://localhost:15672 (admin/admin)
# PostgreSQL: localhost:5432
```

### Production Mode

```bash
# Start production stack
docker compose up --build -d

# API: http://localhost:8080
# Frontend: http://localhost:3001
```

## 📦 Database Setup

### Run Migrations

```bash
docker compose run --rm migrate
```

### Seed Database

```bash
docker compose run --rm seed
```

## 🐳 Docker Images

### Build Targets

```bash
# Production (Alpine)
docker build --target prod -t ecommerce-api:prod .

# Production (Distroless - smallest)
docker build --target prod-distroless -t ecommerce-api:distroless .

# Development
docker build --target dev -t ecommerce-api:dev .
```

### Image Size Comparison

```bash
docker image ls | grep ecommerce-api
```

**Expected sizes:**

- `dev`: ~500MB (includes dev dependencies)
- `prod`: ~150MB (Alpine, production only)
- `prod-distroless`: ~80MB (minimal runtime)

### Image Layers

```bash
# View layer history
docker history ecommerce-api:prod
docker history ecommerce-api:distroless
```

## 🔒 Security

### Non-root User Verification

**Alpine (prod):**

```bash
docker run --rm --entrypoint id ecommerce-api:prod
# Output: uid=1001(nestjs) gid=1001(nodejs) groups=1001(nodejs)
```

**Distroless:**

```bash
docker image inspect ecommerce-api:distroless --format '{{.Config.User}}'
# Output: 65532
```

### Secrets Management

1. Copy `.env.example` to `.env`
2. Generate secrets:

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

3. Update `.env` with generated secrets

## 🧪 Testing

### Test Order Creation (Async via RabbitMQ)

```bash
curl -X POST http://localhost:8080/orders/async \
  -H "Content-Type: application/json" \
  -H "idempotency-key: test-order-001" \
  -d '{
    "userId": "USER_ID",
    "items": [
      {
        "productId": "PRODUCT_ID",
        "qty": 2
      }
    ]
  }'
```

### Check Worker Logs

```bash
docker compose logs -f worker
```

Expected output:

```
📦 Processing: messageId, order: orderId, attempt: 1/3
💾 Order updated to PAID, total: 11000
✅ Success: messageId
```

## 📊 RabbitMQ Monitoring

**Management UI:** http://localhost:15672

- Username: `admin`
- Password: `admin`

**Check Queues:**

- `orders.process` - main queue
- `orders.dlq` - dead letter queue

## 🗂️ Project Structure

```
.
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── orders/   # Order management
│   │   │   ├── worker/   # RabbitMQ consumer
│   │   │   ├── rabbitmq/ # Message queue
│   │   │   ├── files/    # S3 file uploads
│   │   │   └── ...
│   │   └── Dockerfile    # Multi-stage build
│   └── frontend/         # Next.js app
├── compose.yml           # Production docker-compose
├── compose.dev.yml       # Development overrides
└── .env.example          # Environment template
```

## 🔧 Development

### Hot Reload

Changes to `apps/backend/src/**/*.ts` trigger automatic restart.

### Check Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f postgres
```

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:8080/health
```

### Database Connection

```bash
docker exec -it ecommerce-postgres psql -U postgres -d ecommerce

# Check tables
\dt

# Check orders
SELECT * FROM orders LIMIT 10;
```

## 🛑 Cleanup

```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Remove all images
docker compose down --rmi all
```

## 🎯 Features

- ✅ Async order processing via RabbitMQ
- ✅ Retry mechanism (max 3 attempts)
- ✅ Dead Letter Queue (DLQ)
- ✅ Idempotency protection
- ✅ File uploads to AWS S3
- ✅ Docker multi-stage builds
- ✅ Non-root containers
- ✅ Hot reload in development
- ✅ Database migrations
- ✅ Healthchecks

## ⚙️ CI/CD Pipeline

This repository includes a full GitHub Actions pipeline with separated stages:

- PR checks: `.github/workflows/pr-checks.yml`
- Build + stage deploy: `.github/workflows/build-and-stage.yml`
- Production deploy (manual): `.github/workflows/deploy-prod.yml`

### Branch Strategy

- `feature/*` -> open PR into `develop`
- `develop` -> automatic build + stage deploy
- `main` -> production deploy via manual trigger + production approval

### Immutable Artifact

- Docker images are pushed to GHCR as:
  - `ghcr.io/<owner>/ecommerce-api:sha-<commit>`
  - `ghcr.io/<owner>/ecommerce-worker:sha-<commit>`
- `release-manifest.json` is generated during build and uploaded as workflow artifact
- Production deploy reuses image tag from build (no rebuild)

### Required GitHub Setup

1. Create environments:
- `stage`
- `production` (enable Required reviewers for manual approval)

2. Add repository/environment secrets used in deploy jobs:
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `RABBITMQ_URL`
- `RABBITMQ_USER`
- `RABBITMQ_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REFRESH_JWT_SECRET`
- `REFRESH_JWT_EXPIRES_IN`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_ENDPOINT`

3. Optional environment variables:
- `STAGE_SMOKE_URL` (example: `http://localhost:8080/health`)
- `PROD_SMOKE_URL` (example: `https://api.example.com/health`)

### End-to-End Flow

1. Push to `feature/*` and open PR to `develop`
2. `PR Checks` must pass (lint, unit tests, Docker build validation)
3. Merge to `develop` -> image build + push + stage deploy + smoke check
4. Deploy to production by running `Deploy Production` workflow and passing `image_tag` (for example `sha-<commit>`)
5. Approve deployment in `production` environment when prompted
