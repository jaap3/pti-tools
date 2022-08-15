# syntax:docker/dockerfile:1
FROM node:18

WORKDIR /code

COPY package.json /code
RUN npm install
