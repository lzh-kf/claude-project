import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Input, Tag, Popconfirm, Modal, Form, InputNumber, Switch, Tabs, message, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, StarFilled } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getBanners, deleteBanner, createBanner, updateBanner,
  type Banner, type PaginatedResult,
} from '../../api/banners'
import { getProducts, updateProduct, type Product } from '../../api/products'
import { getCategoryTree, updateCategory, type Category } from '../../api/categories'
import request from '../../api/request'

// ==================== Banner Tab ====================

function BannerTab() {
  const [data, setData] = useState<Banner[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res: PaginatedResult<Banner> = await getBanners({ page, pageSize, keyword })
      setData(res.list)
      setTotal(res.total)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [page, pageSize, keyword])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: number) => {
    try {
      await deleteBanner(id)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ sort: 0, status: true })
    setModalOpen(true)
  }

  const openEdit = (record: Banner) => {
    setEditingId(record.id)
    form.setFieldsValue({
      title: record.title,
      image: record.image,
      link: record.link || '',
      sort: record.sort,
      status: record.status === 1,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        link: values.link || null,
        status: values.status ? 1 : 0,
      }
      if (editingId) {
        await updateBanner(editingId, payload)
        message.success('更新成功')
      } else {
        await createBanner(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* handled */ }
    finally { setSubmitting(false) }
  }

  const columns: ColumnsType<Banner> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '缩略图',
      dataIndex: 'image',
      width: 100,
      render: (v: string) => <Image src={v} width={60} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMzAiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxMCI+Tm8gSW1nPC90ZXh0Pjwvc3ZnPg==" />,
    },
    { title: '标题', dataIndex: 'title', width: 180, ellipsis: true },
    {
      title: '跳转链接',
      dataIndex: 'link',
      width: 200,
      ellipsis: true,
      render: (v: string | null) => v || '-',
    },
    { title: '排序', dataIndex: 'sort', width: 70, align: 'center' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
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
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增 Banner</Button>
        <Space.Compact>
          <Input
            placeholder="搜索标题"
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
        scroll={{ x: 1000 }}
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
        title={editingId ? '编辑 Banner' : '新增 Banner'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入 Banner 标题" />
          </Form.Item>
          <Form.Item name="image" label="图片URL" rules={[{ required: true, message: '请输入图片URL' }]}
            extra="支持直接输入图片URL，也可通过上传接口获取">
            <Input placeholder="https://... 或 /uploads/xxx.jpg" />
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="点击 Banner 跳转的链接（可选）" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="sort" label="排序" style={{ marginBottom: 0 }}>
              <InputNumber min={0} placeholder="越小越靠前" />
            </Form.Item>
            <Form.Item name="status" label="启用" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}

// ==================== 推荐商品 Tab ====================

function FeaturedProductsTab() {
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getProducts({ page, pageSize, isFeatured: '1' } as any)
      setData(res.list)
      setTotal(res.total)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [page, pageSize])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRemoveFeatured = async (id: number) => {
    try {
      await updateProduct(id, { isFeatured: 0 } as any)
      message.success('已取消推荐')
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
    { title: '库存', dataIndex: 'stock', width: 80, align: 'center' },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (v: { id: number; name: string } | null) => v ? <Tag>{v.name}</Tag> : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => v === 1 ? <Tag color="green">上架</Tag> : <Tag color="red">下架</Tag>,
    },
    {
      title: '操作',
      width: 140,
      render: (_, record) => (
        <Popconfirm title="确定取消推荐？" onConfirm={() => handleRemoveFeatured(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>取消推荐</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, color: '#666' }}>
        当前展示在首页的推荐商品。如需新增推荐，请前往
        <a href="/products" style={{ margin: '0 4px' }}>商品管理</a>
        设置"推荐"开关。
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
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

// ==================== 首页分类 Tab ====================

function CategoriesTab() {
  const [data, setData] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const tree = await getCategoryTree()
      setData(tree)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleToggleStatus = async (record: Category) => {
    try {
      await updateCategory(record.id, { status: record.status === 1 ? 0 : 1 })
      message.success(record.status === 1 ? '已隐藏' : '已显示')
      fetchData()
    } catch { /* handled */ }
  }

  const handleSortChange = async (id: number, sort: number) => {
    try {
      await updateCategory(id, { sort })
      message.success('排序已更新')
      fetchData()
    } catch { /* handled */ }
  }

  const columns: ColumnsType<Category> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '分类名称', dataIndex: 'name', width: 180 },
    {
      title: '子分类',
      dataIndex: 'children',
      width: 200,
      render: (v: Category[] | undefined) => {
        if (!v || v.length === 0) return '-'
        return v.map(c => <Tag key={c.id} style={{ marginBottom: 4 }}>{c.name}</Tag>)
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 120,
      render: (v: number, record) => (
        <InputNumber
          min={0}
          value={v}
          size="small"
          style={{ width: 80 }}
          onChange={(val) => val !== null && handleSortChange(record.id, val)}
        />
      ),
    },
    {
      title: '首页展示',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (v: number, record) => (
        <Switch
          checked={v === 1}
          checkedChildren="显示"
          unCheckedChildren="隐藏"
          onChange={() => handleToggleStatus(record)}
        />
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, color: '#666' }}>
        首页仅展示顶级分类（status=1 且 parentId 为空）。子分类在商品详情页及分类筛选时使用。
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  )
}

// ==================== 首页配置主页面 ====================

export default function HomeConfigPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>首页配置</h2>
      <Tabs
        defaultActiveKey="banner"
        items={[
          {
            key: 'banner',
            label: <span><UploadOutlined /> Banner 轮播图</span>,
            children: <BannerTab />,
          },
          {
            key: 'featured',
            label: <span><StarFilled style={{ color: '#faad14' }} /> 推荐商品</span>,
            children: <FeaturedProductsTab />,
          },
          {
            key: 'categories',
            label: <span><SearchOutlined /> 首页分类</span>,
            children: <CategoriesTab />,
          },
        ]}
      />
    </div>
  )
}
