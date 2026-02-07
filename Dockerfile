FROM node:lts

RUN mkdir /app

WORKDIR /app

RUN npm i -g http-server

WORKDIR /app/site

COPY site/package*.json .

RUN npm i

WORKDIR /app

COPY . .

WORKDIR /app/site

RUN npm run build

CMD [ "http-server", "-s", "-p", "80", "build" ]
