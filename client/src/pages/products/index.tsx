import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Input, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { getProducts, deleteProduct, type Product, type PaginatedResult } from '../../api/products'

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res: PaginatedResult<Product> = await getProducts({ page, pageSize, keyword })
      setData(res.list)
      setTotal(res.total)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [page, pageSize, keyword])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '商品名称', dataIndex: 'name', width: 200, ellipsis: true },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (v: number) => <span style={{ color: '#cf1322', fontWeight: 500 }}>¥{Number(v).toFixed(2)}</span>,
    },
    {
      title: '原价',
      dataIndex: 'originalPrice',
      width: 100,
      render: (v: number | null) => v ? <span style={{ textDecoration: 'line-through', color: '#999' }}>¥{Number(v).toFixed(2)}</span> : '-',
    },
    { title: '库存', dataIndex: 'stock', width: 80, align: 'center' },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (v: { id: number; name: string } | null) => v ? <Tag>{v.name}</Tag> : '-',
    },
    {
      title: '推荐',
      dataIndex: 'isFeatured',
      width: 70,
      render: (v: number) => v === 1 ? <Tag color="orange">热门</Tag> : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => v === 1 ? <Tag color="green">上架</Tag> : <Tag color="red">下架</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/products/${record.id}/edit`)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/create')}>新增商品</Button>
        <Space.Compact>
          <Input
            placeholder="搜索商品名称"
            prefix={<SearchOutlined />}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={() => { setKeyword(inputValue); setPage(1) }}
            allowClear
            onClear={() => { setInputValue(''); setKeyword(''); setPage(1) }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => { setKeyword(inputValue); setPage(1) }}>搜索</Button>
        </Space.Compact>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps) },
        }}
      />
    </div>
  )
}
