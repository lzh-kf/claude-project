import request from './request'

export interface User {
  id: number
  username: string
  email: string | null
  avatar: string | null
  status: number
  roles: { id: number; name: string; code: string }[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export function getUsers(params: { page?: number; pageSize?: number; keyword?: string }) {
  return request.get<never, PaginatedResult<User>>('/users', { params })
}

export function createUser(data: { username: string; password: string; email?: string; roleIds?: number[] }) {
  return request.post('/users', data)
}

export function updateUser(id: number, data: { username?: string; email?: string; status?: number; password?: string }) {
  return request.put(`/users/${id}`, data)
}

export function deleteUser(id: number) {
  return request.delete(`/users/${id}`)
}

export function assignUserRoles(id: number, roleIds: number[]) {
  return request.put(`/users/${id}/roles`, { roleIds })
}
