FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm i
RUN npm i -g typescript

COPY ./ ./

RUN mkdir /app/cache

RUN chmod 777 /app/cache

RUN tsc

EXPOSE 3007

CMD ["node", "app.js"]
