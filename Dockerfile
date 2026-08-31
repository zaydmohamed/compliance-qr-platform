# ---- Stage 1: Build Frontend ----
FROM node:18-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- Stage 2: Production Server ----
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install --production && cd ..

COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/client/dist ./client/dist

# Create uploads directory (writable on Koyeb)
RUN mkdir -p uploads/logos

# Expose port
EXPOSE 8000

# Set environment
ENV NODE_ENV=production
ENV PORT=8000

# Start Express server
CMD ["node", "server/src/app.js"]
