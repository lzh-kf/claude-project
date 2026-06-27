import request from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  email?: string
}

export interface UserInfo {
  id: number
  username: string
  email: string
  avatar: string | null
  roles: { id: number; name: string; code: string }[]
  permissions: string[]
}

export function login(params: LoginParams) {
  return request.post<never, { token: string; user: Omit<UserInfo, 'roles' | 'permissions'> }>('/auth/login', params)
}

export function register(params: RegisterParams) {
  return request.post('/auth/register', params)
}

export function getMe() {
  return request.get<never, UserInfo>('/auth/me')
}
