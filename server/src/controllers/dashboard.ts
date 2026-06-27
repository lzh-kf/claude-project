import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { success } from '../utils/response'

export async function stats(_req: Request, res: Response) {
  // 汇总卡片数据
  const totalOrders = await prisma.order.count()
  const totalProducts = await prisma.product.count()
  const totalCategories = await prisma.category.count()
  const totalSales = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: 'delivered' },
  })

  // 最近 7 天销售趋势
  const salesTrend: { date: string; amount: number; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const start = new Date()
    start.setDate(start.getDate() - i)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'cancelled' },
      },
      select: { totalAmount: true },
    })

    salesTrend.push({
      date: `${start.getMonth() + 1}/${start.getDate()}`,
      amount: Math.round(orders.reduce((s, o) => s + Number(o.totalAmount), 0) * 100) / 100,
      count: orders.length,
    })
  }

  // 订单状态分布
  const statusGroups = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  })
  const statusLabel: Record<string, string> = {
    pending: '待付款',
    confirmed: '已确认',
    shipped: '已发货',
    delivered: '已完成',
    cancelled: '已取消',
  }
  const orderStatusStats = statusGroups.map(g => ({
    status: statusLabel[g.status] || g.status,
    count: g._count,
  }))

  // 分类商品数量分布
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  })
  const categoryStats = categories.map(c => ({
    name: c.name,
    count: c._count.products,
  }))

  // 最近 5 条订单
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      orderNo: true,
      totalAmount: true,
      status: true,
      consignee: true,
      createdAt: true,
    },
  })

  return success(res, {
    totalSales: Math.round((Number(totalSales._sum.totalAmount) || 0) * 100) / 100,
    totalOrders,
    totalProducts,
    totalCategories,
    salesTrend,
    orderStatusStats,
    categoryStats,
    recentOrders: recentOrders.map(o => ({
      ...o,
      status: statusLabel[o.status] || o.status,
    })),
  })
}
