# Multi-stage production Dockerfile for AIESEC iCX Command Center SvelteKit Web Application
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build static/SSR artifacts
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Production Runtime Stage
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install runtime production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application assets
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/static ./static

# Hardened security: run as non-root node user
USER node

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
