FROM node:krypton-slim AS base
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm


FROM base AS prod-dependencies
COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:krypton-slim AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production

RUN npm install -g pnpm

COPY --from=prod-dependencies /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/tsconfig.json ./tsconfig.json
COPY package.json ./

RUN mkdir -p /app/data && chown -R node:node /app/data /app

EXPOSE 4000 5000

CMD ["pnpm", "start"]