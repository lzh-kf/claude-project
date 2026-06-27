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
  const editorPermCodes = ['user:menu', 'user:view', 'user:create', 'user:update', 'user:assign-role',
    'role:menu', 'role:view', 'role:create', 'role:update', 'role:assign-perm',
    'perm:menu', 'perm:view']
  const editorPermIds = editorPermCodes.map(c => permMap[c]).filter(Boolean)
  await prisma.rolePermission.deleteMany({ where: { roleId: editorRole.id } })
  await prisma.rolePermission.createMany({
    data: editorPermIds.map(permId => ({ roleId: editorRole.id, permissionId: permId })),
  })

  // 给 viewer 角色分配查看权限
  const viewerPermCodes = ['user:menu', 'user:view', 'role:menu', 'role:view', 'perm:menu', 'perm:view']
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
  console.log('🎉 种子数据初始化完成!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
