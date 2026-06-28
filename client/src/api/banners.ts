import request from './request'

export interface Banner {
  id: number
  title: string
  image: string
  link: string | null
  sort: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export function getBanners(params: { page?: number; pageSize?: number; keyword?: string; status?: string }) {
  return request.get<never, PaginatedResult<Banner>>('/banners', { params })
}

export function getBannerById(id: number) {
  return request.get<never, Banner>(`/banners/${id}`)
}

export function createBanner(data: Partial<Banner>) {
  return request.post('/banners', data)
}

export function updateBanner(id: number, data: Partial<Banner>) {
  return request.put(`/banners/${id}`, data)
}

export function deleteBanner(id: number) {
  return request.delete(`/banners/${id}`)
}
