FROM node:lts-bookworm-slim AS base

RUN npm i npm@latest -g && \
    apt-get update && apt-get install -y openssl wget
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 \
    && chmod +x /usr/local/bin/dumb-init
WORKDIR /usr/bot
COPY package*.json ./
COPY src/tsconfig.json .
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install
COPY src/ ./src

FROM base as dev
RUN apt-get install -y procps
ENV NODE_ENV "development"
COPY src/nodemon.json .
CMD ["dumb-init", "npm run dev"]

FROM base AS build
RUN npm run build

FROM node:lts-bookworm-slim AS production
RUN apt-get update && apt-get install -y openssl wget
# install dumb-init
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 \
    && chmod +x /usr/local/bin/dumb-init
WORKDIR /usr/bot
COPY ./docker-entrypoint.sh .
COPY --from=build --chown=node:node /usr/bot/dist ./dist

CMD ["dumb-init", "./docker-entrypoint.sh"]