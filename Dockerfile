FROM node:lts-bookworm-slim AS builder
ARG NODE_ENV="development"
ENV NODE_ENV $NODE_ENV

RUN npm i npm@latest -g && \
    apt-get update && apt-get install -y openssl wget

# install dumb-init
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /usr/bot
COPY package*.json ./
COPY src/tsconfig.json .
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install
COPY src/ ./src
RUN npm run build

FROM node:lts-bookworm-slim AS production
WORKDIR /usr/bot
COPY package*.json .
RUN --mount=type=secret,id=npmrc_prod,target=/root/.npmrc \
    npm ci
COPY --from=builder --chown=node:node /usr/bot/dist ./dist

CMD ["dumb-init", "./docker-entrypoint.sh"]