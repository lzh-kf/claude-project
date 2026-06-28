import request from './request'

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  originalPrice: number | null
  stock: number
  categoryId: number | null
  category: { id: number; name: string } | null
  images: string | null
  status: number
  isFeatured: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export function getProducts(params: { page?: number; pageSize?: number; keyword?: string; status?: string; categoryId?: string; isFeatured?: string }) {
  return request.get<never, PaginatedResult<Product>>('/products', { params })
}

export function getProductById(id: number) {
  return request.get<never, Product>(`/products/${id}`)
}

export function createProduct(data: Partial<Product>) {
  return request.post('/products', data)
}

export function updateProduct(id: number, data: Partial<Product>) {
  return request.put(`/products/${id}`, data)
}

export function deleteProduct(id: number) {
  return request.delete(`/products/${id}`)
}
