import request from './request'

export interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  totalCategories: number
  salesTrend: { date: string; amount: number; count: number }[]
  orderStatusStats: { status: string; count: number }[]
  categoryStats: { name: string; count: number }[]
  recentOrders: { orderNo: string; totalAmount: number; status: string; consignee: string; createdAt: string }[]
}

export function getDashboardStats() {
  return request.get<never, DashboardStats>('/dashboard/stats')
}
