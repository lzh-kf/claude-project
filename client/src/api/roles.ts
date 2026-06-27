import request from './request'

export interface Role {
  id: number
  name: string
  code: string
  description: string | null
  status: number
  _count?: { users: number }
  createdAt: string
  updatedAt: string
}

export interface RoleDetail extends Role {
  permissionIds: number[]
}

export function getRoles(params: { page?: number; pageSize?: number; keyword?: string }) {
  return request.get<never, { list: Role[]; total: number; page: number; pageSize: number }>('/roles', { params })
}

export function getRoleById(id: number) {
  return request.get<never, RoleDetail>(`/roles/${id}`)
}

export function getAllRoles() {
  return request.get<never, { id: number; name: string; code: string }[]>('/roles/all')
}

export function createRole(data: { name: string; code: string; description?: string; permissionIds?: number[] }) {
  return request.post('/roles', data)
}

export function updateRole(id: number, data: { name?: string; code?: string; description?: string; status?: number }) {
  return request.put(`/roles/${id}`, data)
}

export function deleteRole(id: number) {
  return request.delete(`/roles/${id}`)
}

export function assignRolePermissions(id: number, permissionIds: number[]) {
  return request.put(`/roles/${id}/permissions`, { permissionIds })
}
