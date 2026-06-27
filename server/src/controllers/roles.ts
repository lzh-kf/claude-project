import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { success, fail, paginate } from '../utils/response'

export async function list(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const keyword = (req.query.keyword as string) || ''

  const where: any = {}
  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { code: { contains: keyword } },
    ]
  }

  const [list, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.role.count({ where }),
  ])

  return paginate(res, list, total, page, pageSize)
}

export async function all(req: Request, res: Response) {
  const roles = await prisma.role.findMany({
    where: { status: 1 },
    select: { id: true, name: true, code: true },
  })
  return success(res, roles)
}

export async function getById(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: { select: { permissionId: true } },
    },
  })
  if (!role) {
    return fail(res, '角色不存在')
  }
  return success(res, {
    ...role,
    permissionIds: role.permissions.map(rp => rp.permissionId),
  })
}

export async function create(req: Request, res: Response) {
  const { name, code, description, permissionIds } = req.body
  if (!name || !code) {
    return fail(res, '角色名称和编码不能为空')
  }

  const exist = await prisma.role.findFirst({
    where: { OR: [{ name }, { code }] },
  })
  if (exist) {
    return fail(res, '角色名称或编码已存在')
  }

  const role = await prisma.role.create({
    data: { name, code, description },
  })

  if (permissionIds && Array.isArray(permissionIds)) {
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permId: number) => ({ roleId: role.id, permissionId: permId })),
    })
  }

  return success(res, { id: role.id, name: role.name }, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const { name, code, description, status } = req.body

  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    return fail(res, '角色不存在')
  }

  const data: any = {}
  if (name !== undefined) data.name = name
  if (code !== undefined) data.code = code
  if (description !== undefined) data.description = description
  if (status !== undefined) data.status = status

  await prisma.role.update({ where: { id }, data })
  return success(res, null, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    return fail(res, '角色不存在')
  }

  await prisma.rolePermission.deleteMany({ where: { roleId: id } })
  await prisma.userRole.deleteMany({ where: { roleId: id } })
  await prisma.role.delete({ where: { id } })

  return success(res, null, '删除成功')
}

export async function assignPermissions(req: Request, res: Response) {
  const roleId = parseInt(req.params.id)
  const { permissionIds } = req.body

  const role = await prisma.role.findUnique({ where: { id: roleId } })
  if (!role) {
    return fail(res, '角色不存在')
  }

  await prisma.rolePermission.deleteMany({ where: { roleId } })
  if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permId: number) => ({ roleId, permissionId: permId })),
    })
  }

  return success(res, null, '权限分配成功')
}
