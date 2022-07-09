FROM node

COPY package*.json .

RUN npm i

ADD . .

WORKDIR /app

EXPOSE 3000

CMD [ "npm", "start" ]
