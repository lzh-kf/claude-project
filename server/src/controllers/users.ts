import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../utils/prisma'
import { success, fail, paginate } from '../utils/response'

export async function list(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const keyword = (req.query.keyword as string) || ''

  const where: any = {}
  if (keyword) {
    where.OR = [
      { username: { contains: keyword } },
      { email: { contains: keyword } },
    ]
  }

  const [list, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: { role: { select: { id: true, name: true, code: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  const data = list.map(u => ({
    ...u,
    roles: u.roles.map(ur => ur.role),
  }))

  return paginate(res, data, total, page, pageSize)
}

export async function create(req: Request, res: Response) {
  const { username, password, email, roleIds } = req.body
  if (!username || !password) {
    return fail(res, '用户名和密码不能为空')
  }

  const exist = await prisma.user.findUnique({ where: { username } })
  if (exist) {
    return fail(res, '用户名已存在')
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { username, password: hashed, email },
  })

  if (roleIds && Array.isArray(roleIds)) {
    await prisma.userRole.createMany({
      data: roleIds.map((roleId: number) => ({ userId: user.id, roleId })),
    })
  }

  return success(res, { id: user.id, username: user.username }, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const { username, email, status, password } = req.body

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return fail(res, '用户不存在')
  }

  const data: any = {}
  if (username !== undefined) data.username = username
  if (email !== undefined) data.email = email
  if (status !== undefined) data.status = status
  if (password) data.password = await bcrypt.hash(password, 10)

  await prisma.user.update({ where: { id }, data })

  return success(res, null, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return fail(res, '用户不存在')
  }

  await prisma.userRole.deleteMany({ where: { userId: id } })
  await prisma.user.delete({ where: { id } })

  return success(res, null, '删除成功')
}

export async function assignRoles(req: Request, res: Response) {
  const userId = parseInt(req.params.id)
  const { roleIds } = req.body

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return fail(res, '用户不存在')
  }

  await prisma.userRole.deleteMany({ where: { userId } })
  if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
    await prisma.userRole.createMany({
      data: roleIds.map((roleId: number) => ({ userId, roleId })),
    })
  }

  return success(res, null, '角色分配成功')
}
