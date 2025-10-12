ARG NODE_VERSION=20.19.1 
ARG VITE_HOST

FROM node:${NODE_VERSION}-alpine AS build 
WORKDIR /app

COPY ./frontend . 

RUN npm ci 
RUN npm run build 

FROM nginx
COPY --from=build app/build /usr/share/nginx/html/build
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf


