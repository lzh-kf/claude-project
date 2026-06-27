import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { success, fail, paginate } from '../utils/response'

export async function list(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const keyword = (req.query.keyword as string) || ''
  const status = req.query.status as string
  const categoryId = req.query.categoryId as string

  const where: any = {}
  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
    ]
  }
  if (status) {
    where.status = parseInt(status)
  }
  if (categoryId) {
    where.categoryId = parseInt(categoryId)
  }

  const [listData, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return paginate(res, listData, total, page, pageSize)
}

export async function getById(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
    },
  })
  if (!product) {
    return fail(res, '商品不存在')
  }
  return success(res, product)
}

export async function create(req: Request, res: Response) {
  const { name, description, price, originalPrice, stock, categoryId, images, status, isFeatured } = req.body
  if (!name) {
    return fail(res, '商品名称不能为空')
  }
  if (price === undefined || price < 0) {
    return fail(res, '商品价格不能为空')
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      originalPrice: originalPrice || null,
      stock: stock || 0,
      categoryId: categoryId || null,
      images: images || null,
      status: status !== undefined ? status : 1,
      isFeatured: isFeatured || 0,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  })

  return success(res, product, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const { name, description, price, originalPrice, stock, categoryId, images, status, isFeatured } = req.body

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    return fail(res, '商品不存在')
  }

  const data: any = {}
  if (name !== undefined) data.name = name
  if (description !== undefined) data.description = description
  if (price !== undefined) data.price = price
  if (originalPrice !== undefined) data.originalPrice = originalPrice
  if (stock !== undefined) data.stock = stock
  if (categoryId !== undefined) data.categoryId = categoryId
  if (images !== undefined) data.images = images
  if (status !== undefined) data.status = status
  if (isFeatured !== undefined) data.isFeatured = isFeatured

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: { select: { id: true, name: true } },
    },
  })

  return success(res, updated, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    return fail(res, '商品不存在')
  }

  // 检查是否有订单项关联
  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } })
  if (orderItemCount > 0) {
    return fail(res, '该商品已有订单记录，无法删除')
  }

  await prisma.product.delete({ where: { id } })
  return success(res, null, '删除成功')
}
