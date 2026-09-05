# Multi-stage build for Catalog Service
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || true
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S ultrongroup && adduser -S ultronuser -u 1001
COPY --from=builder /app /app
USER ultronuser
EXPOSE 4002
CMD ["node", "src/index.js"]
