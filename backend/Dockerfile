FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate
RUN npm prune --production

COPY src ./src

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/server.js"]
