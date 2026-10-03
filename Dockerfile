# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG MEDIA_PUBLIC_BASE_URL
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN test -n "$NEXT_PUBLIC_API_URL"
RUN npm run build

FROM base AS runtime
ARG APP_REVISION
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
ENV APP_REVISION=$APP_REVISION
RUN test -n "$APP_REVISION"
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
