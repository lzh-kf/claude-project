# RBAC 后台管理系统 Demo

基于 React + Express + Prisma + SQLite 的权限管理系统，用于验证 AI 全栈开发可行性。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design 5 |
| 后端 | Node.js + Express + TypeScript |
| ORM | Prisma |
| 数据库 | SQLite |
| 认证 | JWT |

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run dev
```

后端运行在 http://localhost:3000

### 2. 启动前端

```bash
cd client
npm install
npm run dev
```

前端运行在 http://localhost:5173

### 3. 登录

打开浏览器访问 http://localhost:5173

- 账号: `admin`
- 密码: `admin123`

## 功能

- ✅ 用户登录/注册/个人信息
- ✅ 用户管理（CRUD + 角色分配）
- ✅ 角色管理（CRUD + 权限分配）
- ✅ 权限管理（树形结构 + CRUD）
- ✅ JWT 认证中间件
- ✅ RBAC 权限校验中间件
- ✅ 前端路由守卫 + 菜单控制

## 项目结构

```
├── server/                 # 后端
│   ├── prisma/
│   │   ├── schema.prisma   # 数据库模型
│   │   └── seed.ts         # 种子数据
│   └── src/
│       ├── app.ts          # Express 配置
│       ├── index.ts        # 入口
│       ├── config.ts       # 环境变量
│       ├── middleware/      # 认证+权限中间件
│       ├── controllers/    # 业务逻辑
│       ├── routes/         # 路由
│       └── utils/          # 工具函数
├── client/                 # 前端
│   └── src/
│       ├── api/            # API 请求封装
│       ├── store/          # 状态管理
│       ├── router/         # 路由+守卫
│       ├── layouts/        # 布局组件
│       └── pages/          # 页面
└── README.md
```

## API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/register | 注册 |
| GET | /api/auth/me | 当前用户信息 |
| GET/POST | /api/users | 用户列表/创建 |
| PUT/DELETE | /api/users/:id | 编辑/删除用户 |
| PUT | /api/users/:id/roles | 分配角色 |
| GET/POST | /api/roles | 角色列表/创建 |
| GET | /api/roles/all | 所有角色 |
| GET | /api/roles/:id | 角色详情（含权限ID） |
| PUT/DELETE | /api/roles/:id | 编辑/删除角色 |
| PUT | /api/roles/:id/permissions | 分配权限 |
| GET | /api/permissions/tree | 权限树 |
| GET/POST | /api/permissions | 权限列表/创建 |
| PUT/DELETE | /api/permissions/:id | 编辑/删除权限 |

## 预置数据

| 角色 | 编码 | 权限 |
|---|---|---|
| 超级管理员 | admin | 全部 |
| 编辑者 | editor | 查看+创建+编辑 |
| 只读用户 | viewer | 仅查看 |
