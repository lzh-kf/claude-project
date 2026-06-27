import { useState, useEffect, useCallback } from 'react'
import { Row, Col, Card, Statistic, Table } from 'antd'
import { ShoppingCartOutlined, ShoppingOutlined, AppstoreOutlined } from '@ant-design/icons'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getDashboardStats, type DashboardStats } from '../../api/dashboard'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384']

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (!stats) return null

  const orderColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 180 },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      render: (v: number) => <span style={{ fontWeight: 500 }}>¥{v.toFixed(2)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => {
        const colorMap: Record<string, string> = { '已完成': 'green', '已发货': 'blue', '已确认': 'orange', '待付款': 'gold', '已取消': 'red' }
        return <span style={{ color: colorMap[v] || '#666' }}>{v}</span>
      },
    },
    { title: '收货人', dataIndex: 'consignee', width: 100 },
    {
      title: '时间',
      dataIndex: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={stats.totalSales}
              precision={2}
              prefix="¥"
              suffix="元"
              loading={loading}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              loading={loading}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
              loading={loading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="分类数量"
              value={stats.totalCategories}
              prefix={<AppstoreOutlined />}
              loading={loading}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 销售趋势 + 订单状态分布 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="近 7 天销售趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value: any, name: any) => name === 'amount' ? [`¥${Number(value).toFixed(2)}`, '销售额'] : [value, '订单数']} />
                <Legend formatter={(v: string) => v === 'amount' ? '销售额 (¥)' : '订单数'} />
                <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="订单状态分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.orderStatusStats}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.status} (${entry.count})`}
                >
                  {stats.orderStatusStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 分类分布 + 最近订单 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Card title="商品分类分布">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => [value, '商品数']} />
                <Bar dataKey="count" fill="#1677ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="最近订单">
            <Table
              columns={orderColumns}
              dataSource={stats.recentOrders}
              rowKey="orderNo"
              size="small"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
