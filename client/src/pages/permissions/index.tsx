import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, Tag, Popconfirm, message, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getPermissionTree, getPermissions, createPermission, updatePermission, deletePermission, type Permission } from '../../api/permissions'

export default function PermissionsPage() {
  const [data, setData] = useState<Permission[]>([])
  const [flatData, setFlatData] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
  const [form] = Form.useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tree, flat] = await Promise.all([getPermissionTree(), getPermissions()])
      setData(tree)
      setFlatData(flat)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = (parentId?: number) => {
    setEditingPerm(null)
    form.resetFields()
    form.setFieldsValue({ type: 'button', sort: 0, status: 1, parentId: parentId || undefined })
    setModalOpen(true)
  }

  const openEdit = (perm: Permission) => {
    setEditingPerm(perm)
    form.setFieldsValue({
      name: perm.name,
      code: perm.code,
      description: perm.description,
      type: perm.type,
      path: perm.path,
      icon: perm.icon,
      sort: perm.sort,
      parentId: perm.parentId,
      status: perm.status === 1,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = { ...values, status: values.status ? 1 : 0 }
    try {
      if (editingPerm) {
        await updatePermission(editingPerm.id, payload)
        message.success('更新成功')
      } else {
        await createPermission(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePermission(id)
      message.success('删除成功（含子权限）')
      fetchData()
    } catch { /* handled */ }
  }

  const columns: ColumnsType<Permission> = [
    { title: '名称', dataIndex: 'name', width: 200 },
    {
      title: '编码',
      dataIndex: 'code',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (v: string) => v === 'menu' ? <Tag color="purple">菜单</Tag> : <Tag>按钮</Tag>,
    },
    { title: '路由', dataIndex: 'path', render: v => v || '-' },
    { title: '图标', dataIndex: 'icon', render: v => v || '-' },
    { title: '排序', dataIndex: 'sort', width: 70, align: 'center' },
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
          {record.type === 'menu' && (
            <Button type="link" icon={<PlusOutlined />} onClick={() => openCreate(record.id)}>添加子权限</Button>
          )}
          <Popconfirm title="删除将同时删除子权限，确定？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>新增权限</Button>
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
        title={editingPerm ? '编辑权限' : '新增权限'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="parentId" label="父级权限">
            <Select
              allowClear
              placeholder="不选则为顶级权限"
              options={flatData.map(p => ({ label: `${p.name} (${p.code})`, value: p.id }))}
            />
          </Form.Item>
          <Form.Item name="name" label="权限名称" rules={[{ required: true }]}>
            <Input placeholder="例如：用户管理" />
          </Form.Item>
          <Form.Item name="code" label="权限编码" rules={[{ required: true }]}>
            <Input placeholder="例如：user:create" />
          </Form.Item>
          <Form.Item name="type" label="权限类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '菜单', value: 'menu' },
                { label: '按钮', value: 'button' },
              ]}
            />
          </Form.Item>
          <Form.Item name="path" label="路由路径">
            <Input placeholder="菜单类型填写，例如：/users" />
          </Form.Item>
          <Form.Item name="icon" label="图标名称">
            <Input placeholder="Ant Design 图标名，例如：UserOutlined" />
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
