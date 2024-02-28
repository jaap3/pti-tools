# syntax:docker/dockerfile:1
ARG NODE_VERSION=20

FROM node:$NODE_VERSION as build

WORKDIR /build
COPY package*.json /build/
RUN npm install

FROM node:$NODE_VERSION
WORKDIR /root/.cache
COPY --from=build /build/node_modules/ /root/.cache/node_modules/
WORKDIR /code
COPY entrypoint.sh /code/entrypoint.sh
CMD ["/code/entrypoint.sh"]
