import { useState, useEffect, useCallback } from 'react'
import { Row, Col, Table, Button, Space, Modal, Form, Input, InputNumber, Select, Tag, Popconfirm, message, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getProducts, createProduct, updateProduct, deleteProduct, type Product, type PaginatedResult } from '../../api/products'
import { getCategoryTree, type Category } from '../../api/categories'

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [form] = Form.useForm()

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

  const fetchCategories = async () => {
    try {
      const cats = await getCategoryTree()
      setCategories(cats)
    } catch { /* handled */ }
  }

  const openCreate = async () => {
    setEditingProduct(null)
    form.resetFields()
    form.setFieldsValue({ price: 0, stock: 0, status: 1, isFeatured: false })
    await fetchCategories()
    setModalOpen(true)
  }

  const openEdit = async (product: Product) => {
    setEditingProduct(product)
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      categoryId: product.categoryId,
      images: product.images,
      status: product.status === 1,
      isFeatured: product.isFeatured === 1,
    })
    await fetchCategories()
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      status: values.status ? 1 : 0,
      isFeatured: values.isFeatured ? 1 : 0,
    }
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
        message.success('更新成功')
      } else {
        await createProduct(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  // 递归展平分类树为 select options
  const flattenCategories = (cats: Category[], prefix = ''): { label: string; value: number }[] => {
    return cats.reduce<{ label: string; value: number }[]>((acc, c) => {
      acc.push({ label: prefix + c.name, value: c.id })
      if (c.children) {
        acc.push(...flattenCategories(c.children, prefix + '　'))
      }
      return acc
    }, [])
  }

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '商品名称', dataIndex: 'name', width: 200, ellipsis: true },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (v: number) => <span style={{ color: '#cf1322', fontWeight: 500 }}>¥{v.toFixed(2)}</span>,
    },
    {
      title: '原价',
      dataIndex: 'originalPrice',
      width: 100,
      render: (v: number | null) => v ? <span style={{ textDecoration: 'line-through', color: '#999' }}>¥{v.toFixed(2)}</span> : '-',
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
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增商品</Button>
        <Input
          placeholder="搜索商品名称"
          allowClear
          style={{ width: 240 }}
          onChange={e => { setKeyword(e.target.value); setPage(1) }}
        />
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

      <Modal
        title={editingProduct ? '编辑商品' : '新增商品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="商品名称" />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <Input.TextArea rows={3} placeholder="商品描述（可选）" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="售价" rules={[{ required: true, message: '请输入售价' }]}>
                <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="originalPrice" label="原价">
                <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="stock" label="库存">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="categoryId" label="商品分类">
                <Select
                  allowClear
                  placeholder="选择分类"
                  options={flattenCategories(categories)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="images" label="商品图片">
                <Input placeholder="图片URL逗号分隔" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="上架" valuePropName="checked">
                <Switch checkedChildren="上架" unCheckedChildren="下架" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isFeatured" label="推荐" valuePropName="checked">
                <Switch checkedChildren="推荐" unCheckedChildren="不推荐" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
