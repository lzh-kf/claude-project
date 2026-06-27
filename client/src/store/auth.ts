import { create } from 'zustand'
import { getMe, type UserInfo } from '../api/auth'

interface AuthState {
  user: UserInfo | null
  token: string | null
  loading: boolean
  setAuth: (token: string, user: UserInfo) => void
  logout: () => void
  refresh: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },

  refresh: async () => {
    set({ loading: true })
    try {
      const user = await getMe()
      set({ user, loading: false })
    } catch {
      localStorage.removeItem('token')
      set({ token: null, user: null, loading: false })
    }
  },
}))
