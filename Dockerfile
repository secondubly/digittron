FROM node:jod-slim AS base

ENV PNPM_HOME="/pnpm"
# add pnpm directory to path
ENV PATH="$PNPM_HOME:$PATH"

RUN apt update
# needed to create database file
RUN apt-get install -y sqlite3 && rm -rf /var/cache/apk/*
RUN corepack enable
COPY . ./usr/src/app
WORKDIR /usr/src/app

FROM base AS dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS development
ARG NODE_ENV=development
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY .env /usr/src/app/
# create empty db file sqlite.db
RUN sqlite3 /usr/src/app/sqlite.db "VACUUM;"
# RUN script file
RUN ./initdb.sh
RUN pnpm run build

FROM base AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=development /usr/src/app/build /usr/src/app/build
COPY --from=development /usr/src/app/sqlite.db /usr/src/app/sqlite.db
CMD ["pnpm", "start"]