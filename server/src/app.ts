import express from 'express'
import cors from 'cors'
import path from 'path'
import { prisma } from './utils/prisma'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import roleRoutes from './routes/roles'
import permissionRoutes from './routes/permissions'
import dashboardRoutes from './routes/dashboard'
import categoryRoutes from './routes/categories'
import productRoutes from './routes/products'
import orderRoutes from './routes/orders'
import uploadRoutes from './routes/upload'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/permissions', permissionRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)

// 托管上传文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 数据库统计（无需登录，方便查看数据）
app.get('/api/stats', async (_req, res) => {
  const [users, roles, permissions, userRoles, rolePermissions] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.userRole.count(),
    prisma.rolePermission.count(),
  ])
  res.json({
    code: 0,
    data: {
      users,
      roles,
      permissions,
      userRoles,
      rolePermissions,
    },
  })
})

// 托管前端静态文件（生产环境）
const clientDist = path.join(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

export default app
