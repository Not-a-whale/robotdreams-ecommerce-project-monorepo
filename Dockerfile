FROM node:20-alpine AS base

WORKDIR /app

RUN npm install -g pnpm turbo

FROM base AS deps

COPY package.json pnpm-lock.yaml* package-lock.json* turbo.json ./
COPY apps/backend/package.json ./apps/backend/

RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

COPY apps/backend ./apps/backend
COPY turbo.json ./

WORKDIR /app/apps/backend
RUN npm run build

FROM base AS prod-deps

COPY package.json pnpm-lock.yaml* package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --production --ignore-scripts

FROM node:20-alpine AS prod

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nestjs:nodejs /app/apps/backend/node_modules ./apps/backend/node_modules

COPY --from=build --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/

WORKDIR /app/apps/backend

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS prod-distroless

WORKDIR /app

COPY --from=prod-deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nonroot:nonroot /app/apps/backend/node_modules ./apps/backend/node_modules

COPY --from=build --chown=nonroot:nonroot /app/apps/backend/dist ./apps/backend/dist
COPY --from=build --chown=nonroot:nonroot /app/apps/backend/package.json ./apps/backend/

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["dist/main.js"]

FROM base AS dev

WORKDIR /app

COPY package.json pnpm-lock.yaml* package-lock.json* turbo.json ./
COPY apps/backend/package.json ./apps/backend/

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

FROM base AS migrate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

CMD ["npm", "run", "migration:run"]

FROM base AS seed

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

RUN npm run build

CMD ["npm", "run", "seed"]