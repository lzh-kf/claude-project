FROM node:20-slim

WORKDIR /app

# 安装 Prisma 需要的 OpenSSL
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 1. 安装客户端依赖并构建
COPY client/package*.json client/
RUN cd client && npm install
COPY client/ client/
RUN cd client && npm run build

# 2. 安装服务端依赖（含 Prisma 客户端生成）
COPY server/package*.json server/
COPY server/prisma server/prisma/
RUN cd server && npm install && npx prisma generate

# 3. 复制服务端源码
COPY server/ server/

# 4. 创建数据目录
RUN mkdir -p /var/data

# 5. 暴露端口
EXPOSE 3000

# 6. 启动：迁移数据库 + 种子数据 + 运行服务
CMD cd server && npx prisma migrate deploy && npx tsx prisma/seed.ts && npx tsx src/index.ts
