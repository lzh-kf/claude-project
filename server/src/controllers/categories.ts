import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { success, fail } from '../utils/response'

function buildTree(list: any[], parentId: number | null = null): any[] {
  return list
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map(item => ({
      ...item,
      children: buildTree(list, item.id),
    }))
}

export async function tree(_req: Request, res: Response) {
  const list = await prisma.category.findMany({
    orderBy: { sort: 'asc' },
  })
  return success(res, buildTree(list))
}

export async function list(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { sort: 'asc' },
  })
  return success(res, categories)
}

export async function create(req: Request, res: Response) {
  const { name, description, parentId, sort } = req.body
  if (!name) {
    return fail(res, '分类名称不能为空')
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
      parentId: parentId || null,
      sort: sort || 0,
    },
  })

  return success(res, category, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const { name, description, parentId, sort, status } = req.body

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    return fail(res, '分类不存在')
  }

  const data: any = {}
  if (name !== undefined) data.name = name
  if (description !== undefined) data.description = description
  if (parentId !== undefined) data.parentId = parentId
  if (sort !== undefined) data.sort = sort
  if (status !== undefined) data.status = status

  await prisma.category.update({ where: { id }, data })
  return success(res, null, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    return fail(res, '分类不存在')
  }

  // 检查是否有子分类
  const children = await prisma.category.findMany({ where: { parentId: id } })
  if (children.length > 0) {
    return fail(res, '请先删除子分类')
  }

  // 检查是否有商品关联
  const productCount = await prisma.product.count({ where: { categoryId: id } })
  if (productCount > 0) {
    return fail(res, '该分类下存在商品，无法删除')
  }

  await prisma.category.delete({ where: { id } })
  return success(res, null, '删除成功')
}
