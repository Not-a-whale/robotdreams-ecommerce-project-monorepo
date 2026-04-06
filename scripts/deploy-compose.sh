#!/usr/bin/env bash
set -euo pipefail

TARGET_ENV="${1:-stage}"

if [[ -z "${API_IMAGE_REF:-}" ]]; then
  echo "API_IMAGE_REF is required"
  exit 1
fi

if [[ -z "${WORKER_IMAGE_REF:-}" ]]; then
  echo "WORKER_IMAGE_REF is required"
  exit 1
fi

if [[ -z "${PAYMENTS_IMAGE_REF:-}" ]]; then
  echo "PAYMENTS_IMAGE_REF is required"
  exit 1
fi

SMOKE_URL_DEFAULT="http://localhost:${API_PORT:-8080}/health"
SMOKE_URL="${SMOKE_URL:-$SMOKE_URL_DEFAULT}"

echo "Target environment: ${TARGET_ENV}"
echo "Commit SHA: ${GITHUB_SHA:-unknown}"
echo "API image: ${API_IMAGE_REF}"
echo "Worker image: ${WORKER_IMAGE_REF}"
echo "Payments image: ${PAYMENTS_IMAGE_REF}"

API_IMAGE_REF_SAVED="${API_IMAGE_REF}"
WORKER_IMAGE_REF_SAVED="${WORKER_IMAGE_REF}"
PAYMENTS_IMAGE_REF_SAVED="${PAYMENTS_IMAGE_REF}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  echo "Loaded $(wc -l < .env) env vars from root .env"
fi

export API_IMAGE_REF="${API_IMAGE_REF:-$API_IMAGE_REF_SAVED}"
export WORKER_IMAGE_REF="${WORKER_IMAGE_REF:-$WORKER_IMAGE_REF_SAVED}"
export PAYMENTS_IMAGE_REF="${PAYMENTS_IMAGE_REF:-$PAYMENTS_IMAGE_REF_SAVED}"

if [[ -z "${PAYMENTS_IMAGE_REF}" ]]; then
  echo "PAYMENTS_IMAGE_REF became empty after sourcing .env; set it in the deploy environment or remove PAYMENTS_IMAGE_REF= from .env"
  exit 1
fi

echo "Pulling immutable images..."
docker compose -f compose.yml -f compose.deploy.yml pull payments api worker

echo "Starting infrastructure..."
docker compose -f compose.yml -f compose.deploy.yml up -d --no-build postgres rabbitmq

echo "Waiting for infrastructure readiness..."
for _ in {1..15}; do
  if docker compose -f compose.yml -f compose.deploy.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "Postgres is ready"
    break
  fi
  sleep 2
done

if [[ "${RUN_MIGRATIONS:-false}" == "true" ]]; then
  echo "Running migrations..."
  docker compose -f compose.yml -f compose.deploy.yml build --no-cache migrate
  docker compose -f compose.yml -f compose.deploy.yml run --rm migrate
fi

echo "Starting application services..."
docker compose -f compose.yml -f compose.deploy.yml up -d --no-build payments api worker

echo "Waiting for API readiness..."
for _ in {1..30}; do
  if curl -fsS "${SMOKE_URL}" > /dev/null; then
    echo "Smoke test passed: ${SMOKE_URL}"
    exit 0
  fi
  sleep 2
done

echo "Smoke test failed: ${SMOKE_URL}"
docker compose -f compose.yml -f compose.deploy.yml ps
echo "--- API container logs ---"
docker compose -f compose.yml -f compose.deploy.yml logs --tail=80 api
echo "--- Worker container logs ---"
docker compose -f compose.yml -f compose.deploy.yml logs --tail=40 worker
echo "--- Payments container logs ---"
docker compose -f compose.yml -f compose.deploy.yml logs --tail=40 payments
exit 1
