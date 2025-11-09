# Multi-stage Dockerfile for pnpm monorepo deployment
# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files first for better layer caching
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY tsconfig.json ./

# Build client (Vite/React) - this is the only actual build step needed
RUN pnpm --filter client build

# Stage 2: Production stage
FROM node:20-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies (includes tsx for running TypeScript)
RUN pnpm install --frozen-lockfile --prod

# Copy built client from builder stage
COPY --from=builder /app/packages/client/dist ./packages/client/dist

# Copy client public data files (needed by server for board data)
COPY packages/client/public ./packages/client/public

# Copy server source files (server uses tsx to run TypeScript directly)
COPY packages/server/src ./packages/server/src

# Copy shared source files if needed
COPY packages/shared/src ./packages/shared/src

# Set environment
ENV NODE_ENV=production

# Railway will set PORT dynamically - don't hardcode it
# Default to 3001 only if PORT is not set (handled in app code)

# Note: Railway handles health checks via its own infrastructure
# No need for Docker HEALTHCHECK

# Start the server with tsx
CMD ["pnpm", "--filter", "server", "start"]
