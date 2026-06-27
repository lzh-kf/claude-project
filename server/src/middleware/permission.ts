import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { fail } from '../utils/response'

/**
 * 权限校验中间件工厂：检查当前用户是否拥有指定权限码
 */
export function requirePermission(...codes: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return fail(res, '未登录', 40101, 401)
    }

    const userId = req.user.userId
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    })

    const permSet = new Set<string>()
    for (const ur of userRoles) {
      if (ur.role.status !== 1) continue
      for (const rp of ur.role.permissions) {
        if (rp.permission.status === 1) {
          permSet.add(rp.permission.code)
        }
      }
    }

    // admin 角色拥有所有权限
    if (userRoles.some(ur => ur.role.code === 'admin')) {
      return next()
    }

    const hasAll = codes.every(c => permSet.has(c))
    if (!hasAll) {
      return fail(res, '权限不足', 40301, 403)
    }

    next()
  }
}
