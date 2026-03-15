FROM node:20-slim

WORKDIR /app

# Install frontend deps and build
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

COPY frontend/ frontend/
RUN cd frontend && npm run build

# Install backend deps and build
COPY backend/package*.json backend/
RUN cd backend && npm install

COPY backend/ backend/
RUN cd backend && npm run build

EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "backend/dist/server.js"]
