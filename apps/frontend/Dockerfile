# Development
FROM node:20-alpine AS dev

WORKDIR /app

# Copy package files (handle missing lock file)
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

# Install dependencies (use npm install if no lock file)
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then npm install -g yarn && yarn install --frozen-lockfile; \
    else npm install; fi

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]

# Production Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then npm install -g yarn && yarn install --frozen-lockfile; \
    else npm install; fi

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production Runtime
FROM node:20-alpine AS prod

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]