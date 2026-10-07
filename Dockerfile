FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev /temp/prod

COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
# Explicitly bring in development node_modules into the correct app path
COPY --from=install /temp/dev/node_modules /usr/src/app/node_modules
COPY . .

RUN bun run build

FROM base AS release
# Add curl for healthcheck
USER root
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*
# switch back to bun
USER bun
# Bring in only the production-ready packages
COPY --from=install /temp/prod/node_modules /usr/src/app/node_modules
# Copy the compiled application code and static assets from the build stage
COPY --from=prerelease /usr/src/app /usr/src/app

EXPOSE 3000/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

ENV WEB_PORT=3000

ENTRYPOINT [ "bun", "run", "start" ]