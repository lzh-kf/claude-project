import request from './request'

export interface Member {
  id: number
  phone: string
  nickname: string | null
  avatar: string | null
  gender: number
  birthday: string | null
  status: number
  orderCount: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export function getMembers(params: { page?: number; pageSize?: number; keyword?: string }) {
  return request.get<never, PaginatedResult<Member>>('/members', { params })
}

export function getMember(id: number) {
  return request.get<never, Member>(`/members/${id}`)
}

export function createMember(data: {
  phone: string
  password: string
  nickname?: string
  avatar?: string
  gender?: number
  birthday?: string
  status?: number
}) {
  return request.post('/members', data)
}

export function updateMember(
  id: number,
  data: {
    phone?: string
    password?: string
    nickname?: string
    avatar?: string
    gender?: number
    birthday?: string
    status?: number
  },
) {
  return request.put(`/members/${id}`, data)
}

export function deleteMember(id: number) {
  return request.delete(`/members/${id}`)
}
