import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Select, Button, Switch, Row, Col, message, Spin, Space } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { createProduct, updateProduct, getProductById, type Product } from '../../api/products'
import { getCategoryTree, type Category } from '../../api/categories'
import RichEditor from '../../components/RichEditor'

// 递归展平分类树
function flattenCategories(cats: Category[], prefix = ''): { label: string; value: number }[] {
  return cats.reduce<{ label: string; value: number }[]>((acc, c) => {
    acc.push({ label: prefix + c.name, value: c.id })
    if (c.children) acc.push(...flattenCategories(c.children, prefix + '　'))
    return acc
  }, [])
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([])
  const [description, setDescription] = useState('')

  // 加载分类
  useEffect(() => {
    getCategoryTree().then(cats => setCategories(flattenCategories(cats)))
  }, [])

  // 编辑模式：加载已有商品
  useEffect(() => {
    if (!id) return
    setPageLoading(true)
    getProductById(parseInt(id))
      .then((product: Product) => {
        form.setFieldsValue({
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          stock: product.stock,
          categoryId: product.categoryId,
          images: product.images,
          status: product.status === 1,
          isFeatured: product.isFeatured === 1,
        })
        setDescription(product.description || '')
      })
      .catch(() => message.error('加载商品信息失败'))
      .finally(() => setPageLoading(false))
  }, [id])

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setLoading(true)
    try {
      const payload = {
        ...values,
        description: description || null,
        status: values.status ? 1 : 0,
        isFeatured: values.isFeatured ? 1 : 0,
      }
      if (isEdit) {
        await updateProduct(parseInt(id!), payload)
        message.success('更新成功')
      } else {
        await createProduct(payload)
        message.success('创建成功')
      }
      navigate('/products')
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>返回列表</Button>
          <h2 style={{ margin: 0 }}>{isEdit ? '编辑商品' : '新增商品'}</h2>
        </Space>
        <Space>
          <Button onClick={() => navigate('/products')}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSubmit}>保存</Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" initialValues={{ price: 0, stock: 0, status: true, isFeatured: false }}>
        {/* 基本信息 */}
        <Card title="基本信息" style={{ marginBottom: 24 }}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="请输入商品名称" size="large" />
          </Form.Item>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="price" label="售价" rules={[{ required: true, message: '请输入售价' }]}>
                <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="originalPrice" label="原价">
                <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="stock" label="库存">
                <InputNumber min={0} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="categoryId" label="商品分类">
                <Select allowClear placeholder="选择分类" options={categories} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="images" label="封面图URL" tooltip="商品主图URL，多个用逗号分隔">
                <Input placeholder="https://..." size="large" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="上架状态" valuePropName="checked">
                <Switch checkedChildren="上架" unCheckedChildren="下架" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="isFeatured" label="推荐" valuePropName="checked">
                <Switch checkedChildren="推荐" unCheckedChildren="不推荐" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 商品详情 — 富文本编辑器 */}
        <Card title="商品详情">
          <RichEditor value={description} onChange={setDescription} />
        </Card>
      </Form>
    </div>
  )
}
