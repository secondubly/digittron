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
COPY ./docker-entrypoint.sh ./docker-entrypoint.sh
ENTRYPOINT [ "docker-entrypoint.sh" ]
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install
COPY src/ ./src
RUN npm run build

FROM builder AS production
WORKDIR /usr/bot
USER node
COPY --from=builder --chown=node:node /usr/bot/dist ./dist
CMD ["dumb-init", "./docker-entrypoint.sh"]
# USER node
# RUN npm run build
# CMD ["dumb-init", "./docker-entrypoint.sh"]
# CMD ["dumb-init", "./docker-entrypoint.sh"]

# FROM node:lts-slim AS builder
# ARG OWNER="secondubly"
# ENV OWNER $OWNER
# ENV NODE_ENV $NODE_ENV

# WORKDIR /home/node/bot

# COPY package.json package-lock.json ./

# RUN npm i npm@latest -g && \
#     apt-get update -y && apt-get install -y openssl

# COPY ./docker-entrypoint.sh ./docker-entrypoint.sh
# ENTRYPOINT [ "docker-entrypoint.sh" ]

# RUN --mount=type=secret,id=npmrc \
#     TOKEN=$(cat /run/secrets/npmrc) && \
#     echo //npm.pkg.github.com/:_authToken=${npmrc} >> ~/.npmrc && \
#     echo @${OWNER}:registry=https://npm.pkg.github.com/ >> ~/.npmrc && \
#     npm ci && npm cache clean --force

# ENV PATH /home/node/bot/node_modules/.bin:$PATH

# WORKDIR /home/node/bot

# # build source
# RUN npm run build
# CMD ["./docker-entrypoint.sh"]