# Security Baseline — E-Commerce Shop

**Project**: NestJS (backend) + Next.js (frontend) e-commerce monorepo  
**Date**: 2026-04-26  
**Author**: Security hardening homework submission

---

## 1. Attack Surface Inventory

| Surface | Protocol | Exposed to | Auth required |
|---|---|---|---|
| `POST /auth/signup` | HTTP/REST | Public internet | No |
| `POST /auth/signin` | HTTP/REST | Public internet | No (credentials) |
| `POST /auth/refresh` | HTTP/REST | Public internet | Refresh token |
| `GET  /auth/google/login` | HTTP/REST | Public internet | No |
| `GET  /auth/google/callback` | HTTP/REST | Public internet | No |
| `POST /auth/logout` | HTTP/REST | Public internet | JWT |
| `GET  /user/me/profile` | HTTP/REST | Public internet | JWT |
| `GET  /user/:email` | HTTP/REST | Public internet | JWT |
| `GET  /user` (list all) | HTTP/REST | Public internet | JWT + Admin role |
| `DELETE /user/:id` | HTTP/REST | Public internet | JWT (owner or admin) |
| `GET  /orders` | HTTP/REST | Public internet | JWT (own orders only) |
| `POST /orders` | HTTP/REST | Public internet | JWT |
| `POST /files/upload-avatar` | HTTP/REST | Public internet | JWT |
| `GET  /files/:fileId/url` | HTTP/REST | Public internet | JWT |
| `GET  /health` | HTTP/REST | Public internet | No |
| `/graphql` (orders query/mutation) | HTTP/GraphQL | Public internet | JWT |
| PostgreSQL | TCP 5432 | Internal Docker network only | DB credentials |
| RabbitMQ | AMQP 5672 | Internal Docker network only | AMQP credentials |
| Payments gRPC | TCP 50051 | Internal Docker network only | — |
| Next.js frontend | HTTP/HTTPS | Public internet | Session cookie (HttpOnly) |

---

## 2. Security Controls Implemented

### 2.1 Authentication & Session Management

| Control | Implementation | File(s) |
|---|---|---|
| Password hashing | argon2 (default params, memory-hard) | `auth.service.ts` |
| JWT access tokens | HS256, configurable expiry (default 3600 s), validated on every protected route | `auth/strategies/jwt.strategy.ts` |
| Refresh tokens | Hashed with argon2 before DB storage; rotated on every refresh; nulled on logout | `auth.service.ts`, `user.service.ts` |
| Logout with token invalidation | `POST /auth/logout` sets `hashed_refresh_token = NULL` in DB | `auth.controller.ts`, `auth.service.ts` |
| Frontend session | HttpOnly cookie containing a jose-signed JWT; no JS access | `frontend/lib/session.ts` |
| Google OAuth | Passport `google-oauth20` strategy; tokens never exposed to frontend | `auth/strategies/google.strategy.ts` |

### 2.2 Authorisation & Access Control

| Control | Implementation | File(s) |
|---|---|---|
| JWT guard on all protected routes | `@UseGuards(JwtAuthGuard)` enforced per route | `auth/guards/jwt-auth.guard.ts` |
| Role-based access control | `UserRole` enum (`user` \| `admin`), stored as varchar in DB; `AdminGuard` loads full user row | `user/enums/user-role.enum.ts`, `auth/guards/admin.guard.ts` |
| IDOR prevention — orders | `GET /orders` and `POST /orders` force `userId = token.sub`; user cannot request other users' orders | `orders.controller.ts` |
| IDOR prevention — user delete | `DELETE /user/:id` allows only owner or admin; throws `403 ForbiddenException` otherwise | `user.controller.ts` |
| IDOR prevention — GraphQL orders | `OrdersResolver` overrides filter with `{ userId: gqlUser.id }` | `orders/orders-resolver.ts` |
| GraphQL auth | Dedicated `GqlJwtAuthGuard` + `@GqlCurrentUser()` decorator that reads from GraphQL execution context | `auth/guards/gql-jwt-auth.guard.ts` |

### 2.3 Rate Limiting

| Policy | Limit | Window | Applied to |
|---|---|---|---|
| `auth` | 5 requests | 15 minutes per IP | `POST /auth/signin`, `POST /auth/signup`, `POST /auth/refresh` |
| `global` | 100 requests | 15 minutes per IP | All other endpoints |

**Implementation**: `@nestjs/throttler` v6 with two named throttlers registered as a global `APP_GUARD`.  
**Evidence**: See [security-evidence/rate-limit.txt](security-evidence/rate-limit.txt) — HTTP 429 confirmed on request 5 to `/auth/signin`.

> **Note**: When deployed behind nginx, `app.getHttpAdapter().getInstance().set('trust proxy', 1)` must be set so throttler uses `X-Forwarded-For` (real client IP) instead of the nginx internal IP.

### 2.4 Security Headers

All headers are set by `helmet()` middleware applied in `main.ts` before CORS.

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | `default-src 'none'` (production) | Prevents XSS / data injection |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `no-referrer` | Prevents referrer leakage |
| `X-DNS-Prefetch-Control` | `off` | Prevents DNS prefetch information leak |
| `Cross-Origin-Opener-Policy` | `same-origin` | Prevents cross-origin window attacks |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Controls cross-origin resource sharing |
| `X-Powered-By` | **absent** | Suppressed by `hidePoweredBy: true` |

**Evidence**: See [security-evidence/headers.txt](security-evidence/headers.txt) — real response headers from running container.

### 2.5 Environment Variable Validation & Secrets Management

**Startup validation** (`apps/backend/src/env.validation.ts`):
- All required variables validated with Zod at process start — app exits immediately on failure
- `JWT_SECRET` and `REFRESH_JWT_SECRET` enforce minimum 32-character length
- `FRONTEND_URL` must be a valid URL (prevents open-redirect via misconfiguration)
- Optional variables (Google OAuth, AWS S3, RabbitMQ) have safe defaults or disable the feature

**Secrets storage**:
- Real `.env` files are gitignored; only `.env.example` with placeholders is committed
- In production, secrets should migrate to Docker Swarm secrets / Kubernetes secrets / cloud secrets manager

**Evidence**: See [security-evidence/secret-flow-note.md](security-evidence/secret-flow-note.md).

### 2.6 Audit Logging

Structured JSON audit events emitted via `AuditLoggerService` with NestJS Logger context `Audit`.

| Event | Trigger | Key fields |
|---|---|---|
| `auth.login_failed` | Wrong password or unknown email | `actorId: null`, `reason: 'invalid_password' \| 'user_not_found'` |
| `auth.login_success` | Successful signin | `actorId: <userId>`, `outcome: 'success'` |
| `auth.logout` | `POST /auth/logout` | `actorId: <userId>`, `outcome: 'success'` |
| `order.created` | Order committed to DB | `actorId: <userId>`, `targetId: <orderId>`, `meta.itemCount` |

Every event includes `timestamp` (ISO 8601 UTC). The structured format is pipeline-ready for ingestion into ELK / Loki / CloudWatch.

**Evidence**: See [security-evidence/audit-log-example.txt](security-evidence/audit-log-example.txt) — real log lines from Docker.

### 2.7 TLS Design

TLS terminates at a nginx edge reverse proxy. The API container runs on the private `internal` Docker network and is never directly reachable from the internet. HTTP → HTTPS redirect enforced at nginx. See [security-evidence/tls-note.md](security-evidence/tls-note.md) for full nginx config sketch and network topology diagram.

### 2.8 Input Validation

- NestJS `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true, transform: true` applied globally
- All DTOs use `class-validator` decorators — unknown properties are silently stripped
- File upload controller validates MIME type and file size before processing

---

## 3. OWASP Top 10 Mapping

| OWASP 2021 | Control applied |
|---|---|
| A01 Broken Access Control | RBAC (`UserRole`), IDOR fixes on orders + user delete, `AdminGuard` |
| A02 Cryptographic Failures | argon2 for passwords + refresh tokens, HSTS, TLS at edge, secrets min-length enforced |
| A03 Injection | `ValidationPipe` + `class-validator` on all inputs, TypeORM parameterised queries |
| A04 Insecure Design | Refresh token rotation + logout invalidation, no sensitive data in JWT payload |
| A05 Security Misconfiguration | Zod env validation at startup, helmet headers, CORS restricted to known origins |
| A07 Identification & Authentication Failures | Rate limiting on auth endpoints (5/15 min), argon2 hashing, refresh token nulled on logout |
| A09 Security Logging & Monitoring Failures | Structured audit log for login fail/success, logout, order creation |

---

## 4. Known Gaps & Recommended Next Steps

| Gap | Recommendation |
|---|---|
| Rate limit key is socket IP | Add `app.set('trust proxy', 1)` in `main.ts` before going behind nginx |
| HSTS set by NestJS, also set by nginx | Remove from one layer to avoid duplicate header |
| Audit log is stdout-only | Ship to a persistent store (Loki, CloudWatch, ELK) in production |
| Refresh token not bound to device/IP | Add device fingerprint to detect token theft |
| No automated secret rotation | Integrate with AWS Secrets Manager rotation lambda or Vault dynamic secrets |
| No CSRF protection on REST endpoints | Cookies are `HttpOnly` + `SameSite=Strict`; add CSRF token for forms if needed |
