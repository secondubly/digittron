FROM node:krypton-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable
WORKDIR /usr/src/app
# needed to create database file
# RUN apt-get install -y sqlite3 && rm -rf /var/cache/apk/*

FROM base AS dependencies
COPY package.json /usr/src/app/
COPY pnpm-lock.yaml /usr/src/app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
# needed for building react frontend
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS production
COPY --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/build /usr/src/app/build
COPY --from=build /usr/src/app/data /usr/src/app/data
COPY --from=build /usr/src/app/package.json /usr/src/app/package.json
COPY --from=build /usr/src/app/tsconfig.json /usr/src/app/tsconfig.json

VOLUME ["/usr/src/app/data"]
EXPOSE 5000

CMD ["pnpm", "start"]