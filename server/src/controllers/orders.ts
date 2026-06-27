import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { success, fail, paginate } from '../utils/response'

const statusLabel: Record<string, string> = {
  pending: '待付款',
  confirmed: '已确认',
  shipped: '已发货',
  delivered: '已完成',
  cancelled: '已取消',
}

export async function list(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const keyword = (req.query.keyword as string) || ''
  const status = req.query.status as string

  const where: any = {}
  if (keyword) {
    where.OR = [
      { orderNo: { contains: keyword } },
      { consignee: { contains: keyword } },
    ]
  }
  if (status) {
    where.status = status
  }

  const [listData, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: {
          select: { id: true, productName: true, quantity: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])

  const mapped = listData.map(o => ({
    ...o,
    statusLabel: statusLabel[o.status] || o.status,
  }))

  return paginate(res, mapped, total, page, pageSize)
}

export async function getById(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  })
  if (!order) {
    return fail(res, '订单不存在')
  }
  return success(res, { ...order, statusLabel: statusLabel[order.status] || order.status })
}

export async function updateStatus(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const { status } = req.body

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) {
    return fail(res, '订单不存在')
  }

  // 简单状态校验
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  }

  const allowed = validTransitions[order.status] || []
  if (!allowed.includes(status)) {
    return fail(res, `订单状态不可从 ${statusLabel[order.status]} 变为 ${statusLabel[status] || status}`)
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  })

  return success(res, { ...updated, statusLabel: statusLabel[updated.status] || updated.status }, '状态更新成功')
}
