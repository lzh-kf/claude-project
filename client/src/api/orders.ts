import request from './request'

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productName: string
  productImage: string | null
  price: number
  quantity: number
}

export interface Order {
  id: number
  orderNo: string
  userId: number
  totalAmount: number
  status: string
  statusLabel: string
  consignee: string
  phone: string
  address: string
  remark: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export function getOrders(params: { page?: number; pageSize?: number; keyword?: string; status?: string }) {
  return request.get<never, PaginatedResult<Order>>('/orders', { params })
}

export function getOrderById(id: number) {
  return request.get<never, Order>(`/orders/${id}`)
}

export function updateOrderStatus(id: number, status: string) {
  return request.put(`/orders/${id}/status`, { status })
}
