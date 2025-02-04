FROM node:22-alpine3.20 AS builder

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine3.20 AS production

# ENV NODE_ENV=production 

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --omit=dev

RUN npm i -g cross-env

COPY --from=builder /usr/src/app/dist/ dist/

EXPOSE 8085

CMD ["npm", "run", "start" ]