import request from './request'

export interface Category {
  id: number
  name: string
  description: string | null
  parentId: number | null
  sort: number
  status: number
  createdAt: string
  updatedAt: string
  children?: Category[]
}

export function getCategories() {
  return request.get<never, Category[]>('/categories')
}

export function getCategoryTree() {
  return request.get<never, Category[]>('/categories/tree')
}

export function createCategory(data: Partial<Category>) {
  return request.post('/categories', data)
}

export function updateCategory(id: number, data: Partial<Category>) {
  return request.put(`/categories/${id}`, data)
}

export function deleteCategory(id: number) {
  return request.delete(`/categories/${id}`)
}
