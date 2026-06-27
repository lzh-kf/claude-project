import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Table, Tag, Button, Space, Steps } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getOrderById, type Order, type OrderItem } from '../../api/orders'

const STATUS_STEPS = [
  { title: '待付款', value: 'pending' },
  { title: '已确认', value: 'confirmed' },
  { title: '已发货', value: 'shipped' },
  { title: '已完成', value: 'delivered' },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'gold',
  confirmed: 'orange',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getOrderById(parseInt(id))
      .then(setOrder)
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [id])

  if (!order) return null

  const currentStep = order.status === 'cancelled'
    ? -1
    : STATUS_STEPS.findIndex(s => s.value === order.status)

  const itemColumns: ColumnsType<OrderItem> = [
    { title: '商品图片', dataIndex: 'productImage', width: 80, render: (v: string | null) => v ? <img src={v} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} /> : '-' },
    { title: '商品名称', dataIndex: 'productName' },
    { title: '单价', dataIndex: 'price', width: 100, render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '小计', width: 100, render: (_: unknown, r: OrderItem) => `¥${(r.price * r.quantity).toFixed(2)}` },
  ]

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')} style={{ marginBottom: 16, padding: 0 }}>
        返回订单列表
      </Button>

      <Card title={`订单详情 — ${order.orderNo}`} loading={loading} style={{ marginBottom: 16 }}>
        <Descriptions column={3} bordered size="small">
          <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <Tag color={STATUS_COLOR_MAP[order.status]}>{order.statusLabel}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="下单时间">{new Date(order.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
          <Descriptions.Item label="收货人">{order.consignee}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{order.phone}</Descriptions.Item>
          <Descriptions.Item label="收货地址">{order.address}</Descriptions.Item>
          <Descriptions.Item label="订单金额">
            <span style={{ fontSize: 18, fontWeight: 'bold', color: '#cf1322' }}>¥{order.totalAmount.toFixed(2)}</span>
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{order.remark || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {order.status !== 'cancelled' && (
        <Card title="订单进度" style={{ marginBottom: 16 }}>
          <Steps
            current={currentStep}
            status={order.status === 'cancelled' ? 'error' : undefined}
            items={STATUS_STEPS.map(s => ({ title: s.title }))}
          />
        </Card>
      )}

      <Card title="商品明细">
        <Table
          columns={itemColumns}
          dataSource={order.items}
          rowKey="id"
          pagination={false}
          size="small"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right">
                <strong>合计：</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong style={{ color: '#cf1322', fontSize: 16 }}>¥{order.totalAmount.toFixed(2)}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  )
}
