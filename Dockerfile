ARG OWNER
FROM node:20-buster-slim
ENV NODE_ENV 'development'
ENV OWNER "secondubly"

RUN apt-get update && apt-get install libssl-dev ca-certificates -y

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json .

# Setup npmrc
RUN --mount=type=secret,id=TOKEN \
    TOKEN=$(cat /run/secrets/TOKEN) && \
    echo //npm.pkg.github.com/:_authToken=${TOKEN} >> ~/.npmrc
RUN echo @${OWNER}:registry=https://npm.pkg.github.com/ >> ~/.npmrc

RUN cat ~/.npmrc

# Copy src files
COPY src/ src/

# Install packages
RUN npm ci

# remove github token from npmrc
RUN echo > ~/.npmrc

# Build the project
RUN npm run build

# Run the start script in package.json
CMD ["npm", "run", "start"]