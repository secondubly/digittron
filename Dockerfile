FROM node:20-buster-slim
ENV NODE_ENV='development'
ENV OWNER="@secondubly"

RUN apt-get update && apt-get install libssl-dev ca-certificates -y

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json .

# Copy npmrc
COPY .npmrc .

# Copy src files
COPY src/ src/

# Install packages
RUN npm ci

# Build the project
RUN npm run build

# Run the start script in package.json
CMD ["npm", "run", "start"]