import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始初始化种子数据...')

  // 1. 创建权限
  const permData = [
    // 用户管理
    { name: '用户管理', code: 'user:menu', type: 'menu', path: '/users', icon: 'UserOutlined', sort: 1 },
    { name: '查看用户', code: 'user:view', type: 'button', parentCode: 'user:menu', sort: 1 },
    { name: '创建用户', code: 'user:create', type: 'button', parentCode: 'user:menu', sort: 2 },
    { name: '编辑用户', code: 'user:update', type: 'button', parentCode: 'user:menu', sort: 3 },
    { name: '删除用户', code: 'user:delete', type: 'button', parentCode: 'user:menu', sort: 4 },
    { name: '分配角色', code: 'user:assign-role', type: 'button', parentCode: 'user:menu', sort: 5 },
    // 角色管理
    { name: '角色管理', code: 'role:menu', type: 'menu', path: '/roles', icon: 'TeamOutlined', sort: 2 },
    { name: '查看角色', code: 'role:view', type: 'button', parentCode: 'role:menu', sort: 1 },
    { name: '创建角色', code: 'role:create', type: 'button', parentCode: 'role:menu', sort: 2 },
    { name: '编辑角色', code: 'role:update', type: 'button', parentCode: 'role:menu', sort: 3 },
    { name: '删除角色', code: 'role:delete', type: 'button', parentCode: 'role:menu', sort: 4 },
    { name: '分配权限', code: 'role:assign-perm', type: 'button', parentCode: 'role:menu', sort: 5 },
    // 权限管理
    { name: '权限管理', code: 'perm:menu', type: 'menu', path: '/permissions', icon: 'SafetyOutlined', sort: 3 },
    { name: '查看权限', code: 'perm:view', type: 'button', parentCode: 'perm:menu', sort: 1 },
    { name: '创建权限', code: 'perm:create', type: 'button', parentCode: 'perm:menu', sort: 2 },
    { name: '编辑权限', code: 'perm:update', type: 'button', parentCode: 'perm:menu', sort: 3 },
    { name: '删除权限', code: 'perm:delete', type: 'button', parentCode: 'perm:menu', sort: 4 },
    // ============ 商城模块权限 ============
    // 商品管理
    { name: '商品管理', code: 'product:menu', type: 'menu', path: '/products', icon: 'ShoppingOutlined', sort: 4 },
    { name: '查看商品', code: 'product:view', type: 'button', parentCode: 'product:menu', sort: 1 },
    { name: '创建商品', code: 'product:create', type: 'button', parentCode: 'product:menu', sort: 2 },
    { name: '编辑商品', code: 'product:update', type: 'button', parentCode: 'product:menu', sort: 3 },
    { name: '删除商品', code: 'product:delete', type: 'button', parentCode: 'product:menu', sort: 4 },
    // 分类管理
    { name: '分类管理', code: 'category:menu', type: 'menu', path: '/categories', icon: 'AppstoreOutlined', sort: 5 },
    { name: '查看分类', code: 'category:view', type: 'button', parentCode: 'category:menu', sort: 1 },
    { name: '创建分类', code: 'category:create', type: 'button', parentCode: 'category:menu', sort: 2 },
    { name: '编辑分类', code: 'category:update', type: 'button', parentCode: 'category:menu', sort: 3 },
    { name: '删除分类', code: 'category:delete', type: 'button', parentCode: 'category:menu', sort: 4 },
    // 订单管理
    { name: '订单管理', code: 'order:menu', type: 'menu', path: '/orders', icon: 'ShoppingCartOutlined', sort: 6 },
    { name: '查看订单', code: 'order:view', type: 'button', parentCode: 'order:menu', sort: 1 },
    { name: '处理订单', code: 'order:update', type: 'button', parentCode: 'order:menu', sort: 2 },
  ]

  const permMap: Record<string, number> = {}
  const parentPerms = permData.filter(p => !p.parentCode)
  const childPerms = permData.filter(p => p.parentCode)

  for (const p of parentPerms) {
    const { parentCode, ...data } = p
    const created = await prisma.permission.upsert({
      where: { code: data.code },
      update: data,
      create: data,
    })
    permMap[data.code] = created.id
  }

  for (const p of childPerms) {
    const { parentCode, ...rest } = p
    const parentId = permMap[parentCode!]
    const data = { ...rest, parentId }
    const created = await prisma.permission.upsert({
      where: { code: data.code },
      update: data,
      create: data,
    })
    permMap[data.code] = created.id
  }

  console.log(`✅ 权限数据: ${Object.keys(permMap).length} 条`)

  // 2. 创建角色
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: { name: '超级管理员', description: '拥有所有权限' },
    create: { name: '超级管理员', code: 'admin', description: '拥有所有权限' },
  })

  const editorRole = await prisma.role.upsert({
    where: { code: 'editor' },
    update: { name: '编辑者', description: '可查看和编辑，不可删除' },
    create: { name: '编辑者', code: 'editor', description: '可查看和编辑，不可删除' },
  })

  const viewerRole = await prisma.role.upsert({
    where: { code: 'viewer' },
    update: { name: '只读用户', description: '仅可查看' },
    create: { name: '只读用户', code: 'viewer', description: '仅可查看' },
  })

  console.log('✅ 角色数据: 3 条')

  // 3. 给 admin 角色分配所有权限
  const allPermIds = Object.values(permMap)
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } })
  await prisma.rolePermission.createMany({
    data: allPermIds.map(permId => ({ roleId: adminRole.id, permissionId: permId })),
  })

  // 给 editor 角色分配查看、创建、编辑权限（不含删除）
  const editorPermCodes = [
    'user:menu', 'user:view', 'user:create', 'user:update', 'user:assign-role',
    'role:menu', 'role:view', 'role:create', 'role:update', 'role:assign-perm',
    'perm:menu', 'perm:view',
    'product:menu', 'product:view', 'product:create', 'product:update',
    'category:menu', 'category:view', 'category:create', 'category:update',
    'order:menu', 'order:view', 'order:update',
  ]
  const editorPermIds = editorPermCodes.map(c => permMap[c]).filter(Boolean)
  await prisma.rolePermission.deleteMany({ where: { roleId: editorRole.id } })
  await prisma.rolePermission.createMany({
    data: editorPermIds.map(permId => ({ roleId: editorRole.id, permissionId: permId })),
  })

  // 给 viewer 角色分配查看权限
  const viewerPermCodes = [
    'user:menu', 'user:view',
    'role:menu', 'role:view',
    'perm:menu', 'perm:view',
    'product:menu', 'product:view',
    'category:menu', 'category:view',
    'order:menu', 'order:view',
  ]
  const viewerPermIds = viewerPermCodes.map(c => permMap[c]).filter(Boolean)
  await prisma.rolePermission.deleteMany({ where: { roleId: viewerRole.id } })
  await prisma.rolePermission.createMany({
    data: viewerPermIds.map(permId => ({ roleId: viewerRole.id, permissionId: permId })),
  })

  console.log('✅ 角色-权限关联完成')

  // 4. 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
    },
  })

  // 给管理员分配 admin 角色
  const existingUserRole = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
  })
  if (!existingUserRole) {
    await prisma.userRole.create({
      data: { userId: adminUser.id, roleId: adminRole.id },
    })
  }

  console.log('✅ 管理员用户: admin / admin123')

  // 5. 创建示例商品分类
  const categoryData = [
    { name: '电子产品', description: '手机、电脑、数码配件', sort: 1 },
    { name: '服装鞋帽', description: '男装、女装、鞋类', sort: 2 },
    { name: '食品饮料', description: '零食、饮品、生鲜', sort: 3 },
    { name: '家居生活', description: '家具、家纺、日用品', sort: 4 },
  ]

  const categories: Record<string, number> = {}
  for (const c of categoryData) {
    const created = await prisma.category.create({ data: c })
    categories[c.name] = created.id
    // 每 2 个父分类下各加 2 个子分类
    if (['电子产品', '服装鞋帽'].includes(c.name)) {
      const subNames = c.name === '电子产品'
        ? ['手机配件', '电脑周边']
        : ['男装', '女装']
      for (let i = 0; i < subNames.length; i++) {
        const sub = await prisma.category.create({
          data: { name: subNames[i], parentId: created.id, sort: i + 1 },
        })
        categories[subNames[i]] = sub.id
      }
    }
  }

  console.log('✅ 商品分类: 8 条')

  // 6. 创建示例商品
  const productData = [
    { name: 'iPhone 15 手机壳', price: 29.9, originalPrice: 49.9, stock: 200, categoryName: '手机配件', isFeatured: 1, images: '["https://picsum.photos/seed/p1/400/400"]' },
    { name: 'USB-C 数据线 1米', price: 19.9, originalPrice: 29.9, stock: 500, categoryName: '手机配件', isFeatured: 0, images: '["https://picsum.photos/seed/p2/400/400"]' },
    { name: '机械键盘 87键', price: 299, originalPrice: 399, stock: 80, categoryName: '电脑周边', isFeatured: 1, images: '["https://picsum.photos/seed/p3/400/400"]' },
    { name: '无线鼠标 静音', price: 79, originalPrice: 99, stock: 150, categoryName: '电脑周边', isFeatured: 1, images: '["https://picsum.photos/seed/p4/400/400"]' },
    { name: '男士休闲T恤', price: 89, originalPrice: 159, stock: 300, categoryName: '男装', isFeatured: 1, images: '["https://picsum.photos/seed/p5/400/400"]' },
    { name: '女士连衣裙', price: 199, originalPrice: 359, stock: 120, categoryName: '女装', isFeatured: 1, images: '["https://picsum.photos/seed/p6/400/400"]' },
    { name: '有机坚果礼盒', price: 128, originalPrice: 168, stock: 90, categoryName: '食品饮料', isFeatured: 0, images: '["https://picsum.photos/seed/p7/400/400"]' },
    { name: '记忆棉枕头', price: 159, originalPrice: 259, stock: 60, categoryName: '家居生活', isFeatured: 1, images: '["https://picsum.photos/seed/p8/400/400"]' },
  ]

  const products: { id: number; name: string; price: number }[] = []
  for (const p of productData) {
    const { categoryName, ...data } = p
    const created = await prisma.product.create({
      data: {
        ...data,
        categoryId: categories[categoryName],
      },
    })
    products.push({ id: created.id, name: created.name, price: created.price })
  }

  console.log('✅ 示例商品: 8 条')

  // 7. 创建示例订单（最近 7 天的数据，用于 Dashboard 图表展示）
  const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'shipped', 'confirmed', 'pending', 'cancelled']
  const orderCount = 25

  for (let i = 0; i < orderCount; i++) {
    const daysAgo = Math.floor(Math.random() * 7)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 12) + 8)
    date.setMinutes(Math.floor(Math.random() * 60))

    const itemCount = Math.floor(Math.random() * 3) + 1
    const picked: number[] = []
    let total = 0
    const items: { productId: number; productName: string; productImage: string | null; price: number; quantity: number }[] = []

    for (let j = 0; j < itemCount; j++) {
      const idx = Math.floor(Math.random() * products.length)
      if (picked.includes(idx)) continue
      picked.push(idx)
      const p = products[idx]
      const qty = Math.floor(Math.random() * 3) + 1
      items.push({
        productId: p.id,
        productName: p.name,
        productImage: `https://picsum.photos/seed/p${idx + 1}/100/100`,
        price: p.price,
        quantity: qty,
      })
      total += p.price * qty
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)]

    await prisma.order.create({
      data: {
        orderNo: `ORD${String(Date.now()).slice(-8)}${String(i).padStart(3, '0')}`,
        userId: adminUser.id,
        totalAmount: Math.round(total * 100) / 100,
        status,
        consignee: '张三',
        phone: '13800138000',
        address: '广东省广州市天河区某某路100号',
        createdAt: date,
        updatedAt: date,
        items: {
          create: items,
        },
      },
    })
  }

  console.log(`✅ 示例订单: ${orderCount} 条`)
  console.log('🎉 种子数据初始化完成!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
