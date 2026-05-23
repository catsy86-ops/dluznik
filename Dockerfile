# ===== STAGE 1: Build frontend =====
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ===== STAGE 2: Build backend =====
FROM node:20-alpine AS backend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== STAGE 3: Production image =====
FROM node:20-alpine AS production

WORKDIR /app

# Copy backend build
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy frontend build into backend's public folder
COPY --from=frontend-builder /app/client/dist ./public

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
