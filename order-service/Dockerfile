# ----------------------------
# Stage 1: Install Dependencies
# ----------------------------
FROM node:18-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production


# ----------------------------
# Stage 2: Build (includes dev deps)
# ----------------------------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci


# ----------------------------
# Stage 3: Runtime Image
# ----------------------------
FROM node:18-alpine

WORKDIR /app

LABEL maintainer="FoodOrder DevSecOps"
LABEL description="Order microservice for order management"
LABEL version="1.0.0"

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy production node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy app source with proper ownership
COPY --chown=node:node . .

# Create logs directory and set permissions
RUN mkdir -p logs && chown -R node:node logs

# Use non-root user for security
USER node

# Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Expose service port
EXPOSE 4000

# Start app with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
