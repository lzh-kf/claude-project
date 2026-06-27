import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, Tag, Popconfirm, message, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getCategoryTree, getCategories, createCategory, updateCategory, deleteCategory, type Category } from '../../api/categories'

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([])
  const [flatData, setFlatData] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tree, flat] = await Promise.all([getCategoryTree(), getCategories()])
      setData(tree)
      setFlatData(flat)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = (parentId?: number) => {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({ sort: 0, status: 1, parentId: parentId || undefined })
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    form.setFieldsValue({
      name: cat.name,
      description: cat.description,
      parentId: cat.parentId,
      sort: cat.sort,
      status: cat.status === 1,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      status: values.status ? 1 : 0,
      parentId: values.parentId || null,
    }
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload)
        message.success('更新成功')
      } else {
        await createCategory(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const columns: ColumnsType<Category> = [
    { title: '名称', dataIndex: 'name', width: 250 },
    {
      title: '描述',
      dataIndex: 'description',
      render: v => v || '-',
    },
    { title: '排序', dataIndex: 'sort', width: 80, align: 'center' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
    },
    {
      title: '操作',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Button type="link" icon={<PlusOutlined />} onClick={() => openCreate(record.id)}>添加子分类</Button>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>新增分类</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
        defaultExpandAllRows
      />

      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="parentId" label="父级分类">
            <Select
              allowClear
              placeholder="不选则为顶级分类"
              options={flatData
                .filter(c => c.id !== editingCategory?.id)
                .map(c => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="例如：电子产品" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="分类描述（可选）" />
          </Form.Item>
          <Space style={{ display: 'flex' }} size="large">
            <Form.Item name="sort" label="排序">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="status" label="状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
