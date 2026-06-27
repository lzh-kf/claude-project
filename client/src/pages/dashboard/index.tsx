import { Card, Col, Row, Statistic, Typography } from 'antd'
import { UserOutlined, TeamOutlined, SafetyOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/auth'

const { Title, Paragraph } = Typography

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)

  return (
    <div>
      <Title level={4}>欢迎回来，{user?.username || '管理员'}</Title>
      <Paragraph type="secondary">这是 RBAC 后台权限管理系统，你可以在这里管理用户、角色和权限。</Paragraph>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="用户管理" prefix={<UserOutlined />} value="CRUD" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="角色管理" prefix={<TeamOutlined />} value="CRUD" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="权限管理" prefix={<SafetyOutlined />} value="CRUD" />
          </Card>
        </Col>
      </Row>

      <Card title="系统说明" style={{ marginTop: 24 }}>
        <Paragraph>
          本系统实现了基于 RBAC（Role-Based Access Control）的权限管理模型：
        </Paragraph>
        <ul>
          <li><strong>用户</strong> — 系统使用者，可分配一个或多个角色</li>
          <li><strong>角色</strong> — 权限的集合，如管理员、编辑者、只读用户</li>
          <li><strong>权限</strong> — 细粒度的操作许可，如 user:create、user:delete 等</li>
        </ul>
        <Paragraph>
          预置账号：<code>admin</code> / <code>admin123</code>
        </Paragraph>
      </Card>
    </div>
  )
}
