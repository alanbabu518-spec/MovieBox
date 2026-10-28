FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma 7 requires DATABASE_URL when loading prisma.config.ts.
# Use a temporary URL only during client generation.
RUN DATABASE_URL="postgresql://user:password@localhost:5432/moviebox" npx prisma generate

RUN npm run build


FROM node:24-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 5000

CMD ["node", "dist/server.js"]