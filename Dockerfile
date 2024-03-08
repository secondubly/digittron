FROM node:lts-slim AS builder
ARG OWNER="secondubly"
ENV OWNER $OWNER
ENV NODE_ENV $NODE_ENV

RUN npm i npm@latest -g && \
    apt-get update -y && apt-get install -y openssl

WORKDIR /opt/bot
COPY ./docker-entrypoint.sh ./docker-entrypoint.sh
ENTRYPOINT [ "docker-entrypoint.sh" ]

COPY --chown=node:node package.json package-lock.json ./

RUN --mount=type=secret,id=TOKEN \
    TOKEN=$(cat /run/secrets/TOKEN) && \
    echo //npm.pkg.github.com/:_authToken=${TOKEN} >> ~/.npmrc && \
    echo @${OWNER}:registry=https://npm.pkg.github.com/ >> ~/.npmrc && \
    npm ci && npm cache clean --force

USER node

ENV PATH /opt/bot/node_modules/.bin:$PATH

WORKDIR /opt/bot
COPY --chown=node:node . .

# build source
RUN npm run build
CMD ["npm", "run", "start"]