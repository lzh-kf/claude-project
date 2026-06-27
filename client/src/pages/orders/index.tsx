import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Select, Tag, Modal, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { getOrders, updateOrderStatus, type Order } from '../../api/orders'

const STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '待付款', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'delivered' },
  { label: '已取消', value: 'cancelled' },
]

const NEXT_STATUS_MAP: Record<string, { label: string; value: string; color: string }[]> = {
  pending: [
    { label: '确认', value: 'confirmed', color: 'orange' },
    { label: '取消', value: 'cancelled', color: 'red' },
  ],
  confirmed: [
    { label: '发货', value: 'shipped', color: 'blue' },
    { label: '取消', value: 'cancelled', color: 'red' },
  ],
  shipped: [{ label: '完成', value: 'delivered', color: 'green' }],
  delivered: [],
  cancelled: [],
}

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getOrders({ page, pageSize, status })
      setData(res.list)
      setTotal(res.total)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [page, pageSize, status])

  useEffect(() => { fetchData() }, [fetchData])

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus('')
    setStatusModalOpen(true)
  }

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return
    try {
      await updateOrderStatus(selectedOrder.id, newStatus)
      message.success('状态更新成功')
      setStatusModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  const statusColorMap: Record<string, string> = {
    pending: 'gold',
    confirmed: 'orange',
    shipped: 'blue',
    delivered: 'green',
    cancelled: 'red',
  }

  const columns: ColumnsType<Order> = [
    { title: '订单号', dataIndex: 'orderNo', width: 200 },
    { title: '收货人', dataIndex: 'consignee', width: 100 },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      width: 120,
      render: (v: number) => <span style={{ fontWeight: 500 }}>¥{v.toFixed(2)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'statusLabel',
      width: 100,
      render: (v: string, record) => (
        <Tag color={statusColorMap[record.status] || 'default'}>{v}</Tag>
      ),
    },
    {
      title: '商品',
      dataIndex: 'items',
      width: 200,
      render: (items: Order['items']) => items?.map(i => i.productName).join(', ') || '-',
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/orders/${record.id}`)}>详情</Button>
          {NEXT_STATUS_MAP[record.status]?.length > 0 && (
            <Button type="link" onClick={() => openStatusModal(record)}>处理</Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={v => { setStatus(v); setPage(1) }}
          style={{ width: 140 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps) },
        }}
      />

      <Modal
        title="修改订单状态"
        open={statusModalOpen}
        onOk={handleStatusChange}
        onCancel={() => setStatusModalOpen(false)}
        okButtonProps={{ disabled: !newStatus }}
      >
        <p style={{ marginBottom: 16 }}>
          订单号：<strong>{selectedOrder?.orderNo}</strong>｜当前状态：
          <Tag color={selectedOrder ? statusColorMap[selectedOrder.status] : undefined}>{selectedOrder?.statusLabel}</Tag>
        </p>
        <Select
          placeholder="选择新状态"
          value={newStatus || undefined}
          onChange={v => setNewStatus(v)}
          style={{ width: '100%' }}
          options={(selectedOrder ? NEXT_STATUS_MAP[selectedOrder.status] || [] : []).map(s => ({
            label: s.label,
            value: s.value,
          }))}
        />
      </Modal>
    </div>
  )
}
