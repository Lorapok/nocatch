# NoCatch by Lorapok Labs — Containerized Universal Harvester & CLI
FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY packages/core/package.json ./packages/core/
COPY web/package.json ./web/
COPY server/package.json ./server/
COPY discord-bot/package.json ./discord-bot/

RUN npm ci --omit=dev

# Copy application source
COPY . .

# Labels for GitHub Packages / GHCR association
LABEL org.opencontainers.image.title="NoCatch Universal Harvester" \
      org.opencontainers.image.description="Universal Google NotebookLM Harvester by Lorapok Labs — Web App, CLI & Media Extractor" \
      org.opencontainers.image.url="https://nocatch.lorapok.tech" \
      org.opencontainers.image.source="https://github.com/Lorapok/nocatch" \
      org.opencontainers.image.vendor="Lorapok Labs" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

# Default entrypoint launches CLI
CMD ["node", "packages/core/bin/nocatch.js", "--help"]
