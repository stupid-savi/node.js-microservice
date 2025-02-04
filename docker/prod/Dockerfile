FROM node:22-alpine3.20 AS builder

WORKDIR /usr/src/app

COPY package*.json .



RUN npm install

COPY . .

RUN npm run build
#RUN npm ci - Binary error so not including the ci

FROM node:22-alpine3.20 AS production

# ENV NODE_ENV=production 

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY --from=builder /usr/src/app/dist/ dist/

EXPOSE 8085

CMD ["npm", "run", "start" ]