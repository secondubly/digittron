FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev /temp/prod

COPY package.json bun.lock /temp/dev/
# install all packages in dev
RUN cd /temp/dev && bun install --frozen-lockfile

# only install prod dependencies
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
# Explicitly bring in development node_modules into the correct app path
COPY --from=install /temp/dev/node_modules /usr/src/app/node_modules
COPY . .

RUN bun run build

# Copy exactly what we need for production
# The built frontend is in dist/web, so React pieces are not needed in production
RUN mkdir /out \
    && cp -r tsconfig.json package.json dist src /out/ \
    && rm -rf /out/src/web/react /out/src/web/*.html /out/src/web/styles.css \
    /out/src/web/postcss.config.cjs

# RUN pwd && ls -la /out
# RUN echo "Pausing build for 5 minutes..." && sleep 300

FROM base AS release
# Add curl for healthcheck
USER root
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# create data directory and add bun to owners table
RUN mkdir -p /usr/src/app/data && chown bun:bun /usr/src/app /usr/src/app/data

# switch back to bun
USER bun
# Bring in only the production-ready packages
COPY --chown=bun:bun --from=install /temp/prod/node_modules /usr/src/app/node_modules
# Everything the app needs, in one copy
COPY --chown=bun:bun --from=prerelease /out /usr/src/app

# RUN pwd && ls -la /usr/src/app/src
# RUN echo "Pausing build for 5 minutes..." && sleep 300

EXPOSE 3000/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

ENV WEB_PORT=3000

ENTRYPOINT [ "bun", "run", "start" ]