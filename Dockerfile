FROM node:lts AS build

RUN mkdir /app

WORKDIR /app/site

COPY site/package*.json .

RUN npm i

WORKDIR /app

COPY . .

WORKDIR /app/site

RUN npm run build

FROM nginx AS server

RUN mkdir /app

COPY --from=build /app/site/build /app

COPY site/nginx.conf /etc/nginx/nginx.conf

HEALTHCHECK --interval=10s --timeout=10s --start-period=5s --retries=3 CMD [ "curl","--fail-with-body", "http://localhost" ]
