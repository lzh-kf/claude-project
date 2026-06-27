import request from './request'

export interface Permission {
  id: number
  name: string
  code: string
  description: string | null
  parentId: number | null
  type: string
  path: string | null
  icon: string | null
  sort: number
  status: number
  children?: Permission[]
}

export function getPermissionTree() {
  return request.get<never, Permission[]>('/permissions/tree')
}

export function getPermissions() {
  return request.get<never, Permission[]>('/permissions')
}

export function createPermission(data: {
  name: string
  code: string
  description?: string
  parentId?: number | null
  type?: string
  path?: string
  icon?: string
  sort?: number
}) {
  return request.post('/permissions', data)
}

export function updatePermission(id: number, data: Record<string, any>) {
  return request.put(`/permissions/${id}`, data)
}

export function deletePermission(id: number) {
  return request.delete(`/permissions/${id}`)
}
