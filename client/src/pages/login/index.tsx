import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/auth'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res = await login(values)
      setAuth(res.token, {
        id: res.user.id,
        username: res.user.username,
        email: res.user.email || '',
        avatar: res.user.avatar,
        roles: [],
        permissions: [],
      })
      message.success('登录成功')
      navigate('/dashboard', { replace: true })
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      {/* 装饰性背景圆形 */}
      <div style={{ ...decorCircle, width: 420, height: 420, top: -100, right: -80, background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ ...decorCircle, width: 300, height: 300, bottom: -60, left: -60, background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ ...decorCircle, width: 180, height: 180, top: '40%', left: '15%', background: 'rgba(255,255,255,0.03)' }} />

      <Card
        style={cardStyle}
        bodyStyle={{ padding: '40px 36px' }}
      >
        {/* Logo 区域 */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
          }}>
            <span style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>√</span>
          </div>
          <Title level={3} style={{ marginBottom: 4, color: '#1a1a2e' }}>根号奇商城管理后台</Title>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          size="large"
          initialValues={{ username: 'admin', password: 'admin123' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="用户名"
              style={{ borderRadius: 8, height: 44 }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="密码"
              style={{ borderRadius: 8, height: 44 }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 44,
                borderRadius: 8,
                fontSize: 16,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.35)',
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            提示：默认账号 admin / admin123
          </Text>
        </div>
      </Card>
    </div>
  )
}

// ============ 样式 ============

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  position: 'relative',
  overflow: 'hidden',
} as const

const decorCircle: React.CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  pointerEvents: 'none',
} as const

const cardStyle: React.CSSProperties = {
  width: 420,
  borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  zIndex: 1,
} as const
