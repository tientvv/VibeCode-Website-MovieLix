# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Giữ lại node_modules để sử dụng Prisma CLI & Các lib cần thiết cho Seed
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY prisma ./prisma
COPY seed.js ./

ENV NODE_ENV=production
EXPOSE 3000

# Khởi tạo DB (tạo bảng) -> Cập nhật Admin -> Khởi động server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node seed.js && node .output/server/index.mjs"]
