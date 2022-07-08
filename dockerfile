FROM node

COPY package*.json .

RUN npm install

ADD . .

WORKDIR /app

EXPOSE 3000

CMD [ "npm", "start" ]
