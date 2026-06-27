import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, Tag, Popconfirm, message, Switch } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getUsers, createUser, updateUser, deleteUser, assignUserRoles, type User } from '../../api/users'
import { getAllRoles } from '../../api/roles'

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)

  // 模态框状态
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  // 角色分配模态框
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [assigningUser, setAssigningUser] = useState<User | null>(null)
  const [allRoles, setAllRoles] = useState<{ id: number; name: string; code: string }[]>([])
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUsers({ page, pageSize, keyword })
      setData(res.list)
      setTotal(res.total)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [page, pageSize, keyword])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditingUser(null)
    form.resetFields()
    form.setFieldsValue({ status: 1 })
    setModalOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({ username: user.username, email: user.email, status: user.status === 1 })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = { ...values, status: values.status ? 1 : 0 }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, payload)
        message.success('更新成功')
      } else {
        await createUser(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const openAssignRoles = async (user: User) => {
    setAssigningUser(user)
    const roles = await getAllRoles()
    setAllRoles(roles)
    setSelectedRoles(user.roles.map(r => r.id))
    setRoleModalOpen(true)
  }

  const handleAssignRoles = async () => {
    if (!assigningUser) return
    try {
      await assignUserRoles(assigningUser.id, selectedRoles)
      message.success('角色分配成功')
      setRoleModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username' },
    { title: '邮箱', dataIndex: 'email', render: v => v || '-' },
    {
      title: '角色',
      dataIndex: 'roles',
      render: (roles: User['roles']) =>
        roles.length > 0
          ? roles.map(r => <Tag key={r.id} color="blue">{r.name}</Tag>)
          : <Tag>无角色</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Button type="link" icon={<TeamOutlined />} onClick={() => openAssignRoles(record)}>角色</Button>
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
        <Input
          placeholder="搜索用户名/邮箱"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPage(1) }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增用户</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: t => `共 ${t} 条`,
          onChange: (p, ps) => { setPage(p); setPageSize(ps) },
        }}
      />

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改' : '请输入密码'} />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色分配模态框 */}
      <Modal
        title={`分配角色 - ${assigningUser?.username}`}
        open={roleModalOpen}
        onOk={handleAssignRoles}
        onCancel={() => setRoleModalOpen(false)}
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="请选择角色"
          value={selectedRoles}
          onChange={setSelectedRoles}
          options={allRoles.map(r => ({ label: `${r.name} (${r.code})`, value: r.id }))}
        />
      </Modal>
    </div>
  )
}
