FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Build storefront
FROM node:23-alpine AS storefront_builder

WORKDIR /app

COPY storefront/package*.json ./storefront/

RUN cd storefront && npm ci

COPY . .

COPY --from=builder /app/node_modules ./node_modules

RUN cd storefront && npm run build

# Stage 3: Production
FROM node:23-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src/public ./src/public

COPY --from=storefront_builder /app/extensions ./extensions

CMD ["node", "--max-old-space-size=1024", "dist/src/main.js"]
