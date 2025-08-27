# Multi-stage Dockerfile for NestJS app

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies separately for layer caching
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build the application (needs devDependencies like @nestjs/cli)
FROM deps AS build
COPY . .
RUN npm run build

# Prune dev dependencies to shrink runtime size
RUN npm prune --omit=dev

# Final runtime image
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# Only copy what is needed at runtime
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

EXPOSE 3000
# Because tsconfig includes project root, compiled entry is dist/src/main.js
CMD ["node", "dist/src/main.js"]
