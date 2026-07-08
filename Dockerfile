# Dockerfile para Fly.io (o cualquier PaaS con Docker). Railway y Render NO lo necesitan (autodetectan Node).
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV PORT=8080
ENV DATA_DIR=/data
EXPOSE 8080
CMD ["node", "server.js"]
