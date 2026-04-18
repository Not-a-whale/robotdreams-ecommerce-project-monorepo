# Build from monorepo root (compose: context `.`, dockerfile `apps/frontend/Dockerfile`)
# so workspace packages like `@ecommerce/types` resolve from `packages/types`.

# Debian-based image: Tailwind v4 / lightningcss needs glibc (Alpine/musl breaks native bindings in Docker).
FROM node:20-bookworm-slim AS dev

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci

WORKDIR /app/apps/frontend

EXPOSE 3001

CMD ["npm", "run", "dev"]

FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci

# npm workspaces often skip optional platform packages; install Linux native bindings for Tailwind 4 + lightningcss.
RUN npm install lightningcss-linux-x64-gnu@1.31.1 @tailwindcss/oxide-linux-x64-gnu@4.2.1 --no-save

WORKDIR /app/apps/frontend

ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build --webpack

FROM node:20-bookworm-slim AS prod

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Standalone output mirrors the monorepo path: server.js lives under apps/frontend/
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./

WORKDIR /app/apps/frontend

COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./public

# Real file at /app/server.js so platforms that always run `node /app/server.js` work (symlinks/ENTRYPOINT are often ignored).
COPY --chown=nextjs:nodejs apps/frontend/docker-server-bootstrap.cjs /app/server.js
RUN test -f /app/apps/frontend/server.js

USER nextjs

WORKDIR /app

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "/app/server.js"]
