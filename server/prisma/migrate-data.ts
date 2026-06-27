/**
 * SQLite → MySQL 数据迁移脚本
 * 使用 sql.js 读取 SQLite 数据，Prisma 写入 MySQL
 *
 * 用法: npx tsx prisma/migrate-data.ts
 */
import initSqlJs, { Database } from 'sql.js'
import * as fs from 'fs'
import * as path from 'path'
import { prisma } from '../src/utils/prisma'

const SQLITE_DB = path.join(__dirname, 'dev.db')

async function main() {
  console.log('📦 正在读取 SQLite 数据库...')
  const SQL = await initSqlJs()
  const buffer = fs.readFileSync(SQLITE_DB)
  const db = new SQL.Database(buffer)

  // 禁用 MySQL 外键检查，保证数据可按任意顺序导入
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;')

  // 声明在 try 块外部，供验证使用
  let users: any[] = []
  let roles: any[] = []
  let perms: any[] = []
  let userRoles: any[] = []
  let rolePerms: any[] = []
  let categories: any[] = []
  let products: any[] = []
  let orders: any[] = []
  let orderItems: any[] = []

  try {
    // === 1. User ===
    console.log('📋 迁移 User...')
    users = execAll(db, 'SELECT * FROM User')
    for (const u of users) {
      await prisma.user.create({
        data: {
          id: u.id,
          username: u.username,
          password: u.password,
          email: u.email || null,
          avatar: u.avatar || null,
          status: u.status,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        },
      })
    }
    console.log(`  ✅ ${users.length} 条`)

    // === 2. Role ===
    console.log('📋 迁移 Role...')
    roles = execAll(db, 'SELECT * FROM Role')
    for (const r of roles) {
      await prisma.role.create({
        data: {
          id: r.id,
          name: r.name,
          code: r.code,
          description: r.description || null,
          status: r.status,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        },
      })
    }
    console.log(`  ✅ ${roles.length} 条`)

    // === 3. Permission ===
    console.log('📋 迁移 Permission...')
    perms = execAll(db, 'SELECT * FROM Permission')
    for (const p of perms) {
      await prisma.permission.create({
        data: {
          id: p.id,
          name: p.name,
          code: p.code,
          description: p.description || null,
          parentId: p.parentId || null,
          type: p.type,
          path: p.path || null,
          icon: p.icon || null,
          sort: p.sort,
          status: p.status,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        },
      })
    }
    console.log(`  ✅ ${perms.length} 条`)

    // === 4. UserRole ===
    console.log('📋 迁移 UserRole...')
    userRoles = execAll(db, 'SELECT * FROM UserRole')
    for (const ur of userRoles) {
      await prisma.userRole.create({
        data: { userId: ur.userId, roleId: ur.roleId },
      })
    }
    console.log(`  ✅ ${userRoles.length} 条`)

    // === 5. RolePermission ===
    console.log('📋 迁移 RolePermission...')
    rolePerms = execAll(db, 'SELECT * FROM RolePermission')
    for (const rp of rolePerms) {
      await prisma.rolePermission.create({
        data: { roleId: rp.roleId, permissionId: rp.permissionId },
      })
    }
    console.log(`  ✅ ${rolePerms.length} 条`)

    // === 6. Category ===
    console.log('📋 迁移 Category...')
    categories = execAll(db, 'SELECT * FROM Category')
    for (const c of categories) {
      await prisma.category.create({
        data: {
          id: c.id,
          name: c.name,
          description: c.description || null,
          parentId: c.parentId || null,
          sort: c.sort,
          status: c.status,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        },
      })
    }
    console.log(`  ✅ ${categories.length} 条`)

    // === 7. Product ===
    console.log('📋 迁移 Product...')
    products = execAll(db, 'SELECT * FROM Product')
    for (const p of products) {
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          description: p.description || null,
          price: p.price,
          originalPrice: p.originalPrice || null,
          stock: p.stock,
          categoryId: p.categoryId || null,
          images: p.images || null,
          status: p.status,
          isFeatured: p.isFeatured,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        },
      })
    }
    console.log(`  ✅ ${products.length} 条`)

    // === 8. Order ===
    console.log('📋 迁移 Order...')
    orders = execAll(db, 'SELECT * FROM "Order"')
    for (const o of orders) {
      await prisma.order.create({
        data: {
          id: o.id,
          orderNo: o.orderNo,
          userId: o.userId,
          totalAmount: o.totalAmount,
          status: o.status,
          consignee: o.consignee,
          phone: o.phone,
          address: o.address,
          remark: o.remark || null,
          createdAt: new Date(o.createdAt),
          updatedAt: new Date(o.updatedAt),
        },
      })
    }
    console.log(`  ✅ ${orders.length} 条`)

    // === 9. OrderItem ===
    console.log('📋 迁移 OrderItem...')
    orderItems = execAll(db, 'SELECT * FROM OrderItem')
    for (const oi of orderItems) {
      await prisma.orderItem.create({
        data: {
          id: oi.id,
          orderId: oi.orderId,
          productId: oi.productId,
          productName: oi.productName,
          productImage: oi.productImage || null,
          price: oi.price,
          quantity: oi.quantity,
        },
      })
    }
    console.log(`  ✅ ${orderItems.length} 条`)

    console.log('\n🎉 数据迁移完成！')
  } finally {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;')
  }

  // 验证
  console.log('\n🔍 验证数据完整性...')
  const counts = await Promise.all([
    prisma.user.count().then(c => ({ table: 'User', count: c })),
    prisma.role.count().then(c => ({ table: 'Role', count: c })),
    prisma.permission.count().then(c => ({ table: 'Permission', count: c })),
    prisma.userRole.count().then(c => ({ table: 'UserRole', count: c })),
    prisma.rolePermission.count().then(c => ({ table: 'RolePermission', count: c })),
    prisma.category.count().then(c => ({ table: 'Category', count: c })),
    prisma.product.count().then(c => ({ table: 'Product', count: c })),
    prisma.order.count().then(c => ({ table: 'Order', count: c })),
    prisma.orderItem.count().then(c => ({ table: 'OrderItem', count: c })),
  ])
  const expected: Record<string, number> = {
    User: users.length,
    Role: roles.length,
    Permission: perms.length,
    UserRole: userRoles.length,
    RolePermission: rolePerms.length,
    Category: categories.length,
    Product: products.length,
    Order: orders.length,
    OrderItem: orderItems.length,
  }
  for (const { table, count } of counts) {
    const exp = expected[table]
    const status = count === exp ? '✅' : '❌'
    console.log(`  ${status} ${table}: ${count} (期望 ${exp})`)
  }

  db.close()
}

/** 执行查询并返回所有行（列名驼峰映射） */
function execAll(db: Database, sql: string): any[] {
  const result = db.exec(sql)
  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj
  })
}

main()
  .catch(e => {
    console.error('迁移失败:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
