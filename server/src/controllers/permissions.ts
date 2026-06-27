import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { success, fail } from '../utils/response'

const prisma = new PrismaClient()

function buildTree(list: any[], parentId: number | null = null): any[] {
  return list
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map(item => ({
      ...item,
      children: buildTree(list, item.id),
    }))
}

export async function tree(req: Request, res: Response) {
  const list = await prisma.permission.findMany({
    orderBy: { sort: 'asc' },
  })
  return success(res, buildTree(list))
}

export async function list(req: Request, res: Response) {
  const perms = await prisma.permission.findMany({
    orderBy: { sort: 'asc' },
  })
  return success(res, perms)
}

export async function create(req: Request, res: Response) {
  const { name, code, description, parentId, type, path, icon, sort } = req.body
  if (!name || !code) {
    return fail(res, '权限名称和编码不能为空')
  }

  const exist = await prisma.permission.findUnique({ where: { code } })
  if (exist) {
    return fail(res, '权限编码已存在')
  }

  const perm = await prisma.permission.create({
    data: {
      name,
      code,
      description,
      parentId: parentId || null,
      type: type || 'button',
      path,
      icon,
      sort: sort || 0,
    },
  })

  return success(res, perm, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const { name, code, description, parentId, type, path, icon, sort, status } = req.body

  const perm = await prisma.permission.findUnique({ where: { id } })
  if (!perm) {
    return fail(res, '权限不存在')
  }

  const data: any = {}
  if (name !== undefined) data.name = name
  if (code !== undefined) data.code = code
  if (description !== undefined) data.description = description
  if (parentId !== undefined) data.parentId = parentId
  if (type !== undefined) data.type = type
  if (path !== undefined) data.path = path
  if (icon !== undefined) data.icon = icon
  if (sort !== undefined) data.sort = sort
  if (status !== undefined) data.status = status

  await prisma.permission.update({ where: { id }, data })
  return success(res, null, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const perm = await prisma.permission.findUnique({ where: { id } })
  if (!perm) {
    return fail(res, '权限不存在')
  }

  // 删除子权限的关联
  const children = await prisma.permission.findMany({ where: { parentId: id } })
  for (const child of children) {
    await prisma.rolePermission.deleteMany({ where: { permissionId: child.id } })
    await prisma.permission.delete({ where: { id: child.id } })
  }

  await prisma.rolePermission.deleteMany({ where: { permissionId: id } })
  await prisma.permission.delete({ where: { id } })

  return success(res, null, '删除成功')
}
