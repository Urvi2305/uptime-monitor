FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "node src/db/migrate.js && node src/server.js"]
