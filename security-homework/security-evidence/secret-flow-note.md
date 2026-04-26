# Secrets Management Note

## Secret categories and storage

| Secret | Where stored | Injected via |
|---|---|---|
| `JWT_SECRET` (≥32 chars) | `apps/backend/.env` (gitignored) | Docker `env_file` |
| `REFRESH_JWT_SECRET` (≥32 chars) | `apps/backend/.env` (gitignored) | Docker `env_file` |
| `SESSION_SECRET_KEY` (Next.js session) | `apps/frontend/.env` (gitignored) | Docker `env_file` |
| `DB_PASSWORD` | `apps/backend/.env` (gitignored) | Docker `env_file` |
| `GOOGLE_CLIENT_SECRET` | `apps/backend/.env` (gitignored) | Docker `env_file` |
| `AWS_SECRET_ACCESS_KEY` | `apps/backend/.env` (gitignored) | Docker `env_file` |
| `STRIPE_SECRET_KEY` | `apps/payments-service/.env` (gitignored) | Docker `env_file` |

## What is committed to git

Only `.env.example` files with placeholder values are committed:

```
JWT_SECRET=CHANGE_ME_use_at_least_32_random_characters_here
REFRESH_JWT_SECRET=CHANGE_ME_use_at_least_32_random_characters_here
SESSION_SECRET_KEY=CHANGE_ME_64_hex_chars_here
```

Real `.env` files are listed in `.gitignore`.

## Startup validation

`apps/backend/src/env.validation.ts` uses **Zod** to validate all environment variables at
application startup (`validateEnv()` is the first call in `main.ts`).
If any required secret is missing or a JWT secret is shorter than 32 characters, the process
exits immediately with a descriptive error — the API never starts with a weak or absent secret.

```
❌ Environment validation failed:
  JWT_SECRET: String must contain at least 32 character(s)
```

## Secret generation guidance

```bash
# Generate a 64-character hex JWT secret (Linux/macOS)
openssl rand -hex 32

# PowerShell equivalent
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

## Production secret management (recommended upgrade path)

For production deployments, secrets should be moved from `.env` files to a dedicated
secrets manager:

- **Docker Swarm**: use `docker secret` — mounted as `/run/secrets/<name>` at runtime
- **Kubernetes**: use `Secret` objects with encryption at rest + RBAC access control
- **Cloud**: AWS Secrets Manager / GCP Secret Manager / Azure Key Vault fetched at init

The application code requires no changes for this migration — only the `env_file` directive
in `compose.yml` needs to be replaced with secret mounts or an init container that writes
the secrets to environment variables.

## Refresh token security

Refresh tokens are **never stored in plaintext**.
Upon issuance, `argon2.hash(refreshToken)` is stored in the `users.hashed_refresh_token`
database column. On rotation, the stored hash is compared with `argon2.verify()`.
On logout (`POST /auth/logout`), the column is set to `NULL`, permanently invalidating
the token even if it were stolen before expiry.
