import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown, Breadcrumb, theme } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '../store/auth'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/roles', icon: <TeamOutlined />, label: '角色管理' },
  { key: '/permissions', icon: <SafetyOutlined />, label: '权限管理' },
  { key: '/products', icon: <ShoppingOutlined />, label: '商品管理' },
  { key: '/categories', icon: <AppstoreOutlined />, label: '分类管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
]

// 面包屑路径映射
const breadcrumbMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/users': '用户管理',
  '/roles': '角色管理',
  '/permissions': '权限管理',
  '/products': '商品管理',
  '/categories': '分类管理',
  '/orders': '订单管理',
}

// 根据当前路径生成面包屑
function getBreadcrumbs(pathname: string): { title: string }[] {
  const items: { title: string }[] = [{ title: '首页' }]

  // 精确匹配
  if (breadcrumbMap[pathname]) {
    items.push({ title: breadcrumbMap[pathname] })
    return items
  }

  // 子路由匹配：如 /orders/123 → 订单管理 > 订单详情
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2) {
    const parentPath = '/' + parts[0]
    if (breadcrumbMap[parentPath]) {
      items.push({ title: breadcrumbMap[parentPath] })
      // 最后一段作为详情标题
      const detailMap: Record<string, string> = {
        'orders': '订单详情',
      }
      const detailLabel = detailMap[parts[0]] || parts[1]
      items.push({ title: detailLabel })
      return items
    }
  }

  return items
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { token: themeToken } = theme.useToken()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {collapsed ? 'RBAC' : 'RBAC 管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ overflow: 'hidden' }}>
        <Header style={{
          background: themeToken.colorBgContainer,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems, onClick: handleLogout }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserOutlined />
              <span>{user?.username || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: themeToken.colorBgContainer, borderRadius: 8, overflow: 'auto' }}>
          <Breadcrumb
            items={getBreadcrumbs(location.pathname)}
            style={{ marginBottom: 16 }}
          />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
