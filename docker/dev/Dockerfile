# Base image it will have os image also and it's binaries  for e.g ubuntu etc.
FROM node:22

# Install pnpm globally
RUN npm install -g pnpm

# creating a working directory inside Docker
WORKDIR /usr/src/app

# Copy package json and lock file
COPY package*.json  .
COPY pnpm-lock.yaml .

# Install node modules
RUN pnpm install

# Copy the source code
COPY . .

# Exposing port of host machine to use conatiner running code
EXPOSE 8085

# Running the app in dev mode
CMD [ "pnpm", "run", "dev" ]






