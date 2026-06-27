import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { signToken } from '../utils/jwt'
import { success, fail } from '../utils/response'

const prisma = new PrismaClient()

export async function login(req: Request, res: Response) {
  const { username, password } = req.body
  if (!username || !password) {
    return fail(res, '用户名和密码不能为空')
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    return fail(res, '用户名或密码错误')
  }
  if (user.status !== 1) {
    return fail(res, '账号已被禁用')
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return fail(res, '用户名或密码错误')
  }

  const token = signToken({ userId: user.id, username: user.username })
  return success(res, {
    token,
    user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
  }, '登录成功')
}

export async function register(req: Request, res: Response) {
  const { username, password, email } = req.body
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

  // 默认给新用户分配 viewer 角色
  const viewer = await prisma.role.findUnique({ where: { code: 'viewer' } })
  if (viewer) {
    await prisma.userRole.create({ data: { userId: user.id, roleId: viewer.id } })
  }

  return success(res, { id: user.id, username: user.username }, '注册成功')
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return fail(res, '用户不存在', -1, 404)
  }

  const roles = user.roles.map(ur => ({ id: ur.role.id, name: ur.role.name, code: ur.role.code }))
  const perms = new Set<string>()
  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) {
      if (rp.permission.status === 1) {
        perms.add(rp.permission.code)
      }
    }
  }

  return success(res, {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    roles,
    permissions: Array.from(perms),
  })
}
