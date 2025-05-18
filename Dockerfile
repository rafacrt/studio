
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json* ./
# Install dependencies
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built artifacts from the 'builder' stage
# Copy the standalone folder
COPY --from=builder /app/.next/standalone ./
# Copy the public folder
COPY --from=builder /app/public ./public
# Copy the static assets from .next/static
COPY --from=builder /app/.next/static ./.next/static

# Set user and permissions
USER nextjs
# Ensure the user has permissions for the .next directory if needed for cache, etc.
# However, for standalone output, this might not be strictly necessary for basic operation.
# If runtime caching or ISR needs write access, you might need to adjust ownership or permissions.

EXPOSE 3000

ENV PORT 3000
# NEXT_TELEMETRY_DISABLED is set to 1 by default in Next.js 13.4+ for docker images.

# Start the Next.js application
# server.js is created by the standalone output
CMD ["node", "server.js"]
