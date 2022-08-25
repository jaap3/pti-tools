# syntax:docker/dockerfile:1
FROM node:18 as build

WORKDIR /build
COPY package*.json /build/
RUN npm install

FROM node:18
WORKDIR /root/.cache
COPY --from=build /build/node_modules/ /root/.cache/node_modules/
WORKDIR /code
COPY entrypoint.sh /code/entrypoint.sh
CMD ["/code/entrypoint.sh"]
