FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build application
RUN npm run build

# Remove development dependencies and files not needed in production
RUN npm prune --production
RUN rm -rf src test

FROM node:18-alpine AS production

# Set NODE_ENV
ENV NODE_ENV production

# Create app directory
WORKDIR /app

# Create a non-root user and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy package files from builder
COPY --from=builder /app/package*.json ./

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Create types directory if needed and copy bcrypt type definition
RUN mkdir -p /app/prisma/types

# Copy startup script and make it executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Change file ownership to non-root user
RUN chown -R nestjs:nodejs /app /docker-entrypoint.sh

# Expose application port
EXPOSE 3000

# Switch to non-root user
USER nestjs

# Set up health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
