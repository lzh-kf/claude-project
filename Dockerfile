FROM node:20-alpine

WORKDIR /app

# 1. 安装客户端依赖并构建
COPY client/package*.json client/
RUN cd client && npm install
COPY client/ client/
RUN cd client && npm run build

# 2. 安装服务端依赖
COPY server/package*.json server/
COPY server/prisma server/prisma/
RUN cd server && npm install

# 3. 复制服务端源码
COPY server/ server/

# 4. 暴露端口
EXPOSE 3000

# 5. 启动：迁移数据库 + 种子数据 + 运行服务
CMD cd server && npx prisma migrate deploy && npx tsx prisma/seed.ts && npx tsx src/index.ts
