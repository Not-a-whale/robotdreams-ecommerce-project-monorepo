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

SMOKE_URL_DEFAULT="http://localhost:${API_PORT:-8080}/health"
SMOKE_URL="${SMOKE_URL:-$SMOKE_URL_DEFAULT}"

echo "Target environment: ${TARGET_ENV}"
echo "Commit SHA: ${GITHUB_SHA:-unknown}"
echo "API image: ${API_IMAGE_REF}"
echo "Worker image: ${WORKER_IMAGE_REF}"

echo "Pulling immutable images..."
docker compose -f compose.yml -f compose.deploy.yml pull api worker

echo "Starting services without rebuild..."
docker compose -f compose.yml -f compose.deploy.yml up -d --no-build postgres rabbitmq api worker

if [[ "${RUN_MIGRATIONS:-false}" == "true" ]]; then
  echo "Running migrations..."
  docker compose -f compose.yml -f compose.deploy.yml run --rm migrate
fi

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
exit 1
