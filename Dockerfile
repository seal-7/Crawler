FROM node:8
MAINTAINER Raj Talekar "rajtalekar24@gmail.com""

#Setting up app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node app.js
