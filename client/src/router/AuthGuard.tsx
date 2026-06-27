import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '../store/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, user, loading, refresh } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (token && !user && !loading) {
      refresh()
    }
  }, [token])

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return <>{children}</>
}
