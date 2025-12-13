FROM node:18-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:18-alpine

WORKDIR /app

LABEL maintainer="FoodOrder DevSecOps"
LABEL description="Payment microservice with idempotency and fraud detection"

# RUN apk add --no-cache dumb-init

COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN mkdir -p logs && chown -R node:node logs

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

EXPOSE 3003

# ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
