import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Input, Space, Modal, Form, Tree, Tag, Popconfirm, message, Switch } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getRoles, getRoleById, createRole, updateRole, deleteRole, assignRolePermissions, type Role } from '../../api/roles'
import { getPermissionTree, type Permission } from '../../api/permissions'

export default function RolesPage() {
  const [data, setData] = useState<Role[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()

  // 权限分配
  const [permModalOpen, setPermModalOpen] = useState(false)
  const [assigningRole, setAssigningRole] = useState<Role | null>(null)
  const [permTree, setPermTree] = useState<Permission[]>([])
  // 存储选中的权限ID集合（存放子节点ID, 自动联动勾选父节点）
  const [expandedKeys, setExpandedKeys] = useState<number[]>([])
  const [checkedKeys, setCheckedKeys] = useState<number[]>([])
  const [permLoaded, setPermLoaded] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRoles({ page, pageSize, keyword })
      setData(res.list)
      setTotal(res.total)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [page, pageSize, keyword])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditingRole(null)
    form.resetFields()
    form.setFieldsValue({ status: 1 })
    setModalOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue({ name: role.name, code: role.code, description: role.description, status: role.status === 1 })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = { ...values, status: values.status ? 1 : 0 }
    try {
      if (editingRole) {
        await updateRole(editingRole.id, payload)
        message.success('更新成功')
      } else {
        await createRole(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const openAssignPerms = async (role: Role) => {
    setAssigningRole(role)
    const [tree, detail] = await Promise.all([
      getPermissionTree(),
      getRoleById(role.id),
    ])
    setPermTree(tree)
    setCheckedKeys(detail.permissionIds || [])
    setExpandedKeys(tree.map(p => p.id))
    setPermLoaded(true)
    setPermModalOpen(true)
  }

  const handleAssignPerms = async () => {
    if (!assigningRole) return
    try {
      await assignRolePermissions(assigningRole.id, checkedKeys)
      message.success('权限分配成功')
      setPermModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  // 递归获取所有 key（用于 Tree 的 checkedKeys 全选/清空）
  const getAllKeys = (nodes: Permission[]): number[] => {
    let keys: number[] = []
    for (const n of nodes) {
      keys.push(n.id)
      if (n.children) keys = keys.concat(getAllKeys(n.children))
    }
    return keys
  }

  const columns: ColumnsType<Role> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code', render: (v: string) => <Tag>{v}</Tag> },
    { title: '描述', dataIndex: 'description', render: v => v || '-' },
    { title: '用户数', dataIndex: ['_count', 'users'], width: 80, align: 'center' },
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
      width: 260,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Button type="link" icon={<SafetyOutlined />} onClick={() => openAssignPerms(record)}>权限</Button>
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
          placeholder="搜索名称/编码"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPage(1) }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增角色</Button>
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

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input placeholder="例如：超级管理员" />
          </Form.Item>
          <Form.Item name="code" label="角色编码" rules={[{ required: true }]}>
            <Input placeholder="例如：admin" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="角色描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`分配权限 - ${assigningRole?.name}`}
        open={permModalOpen}
        onOk={handleAssignPerms}
        onCancel={() => setPermModalOpen(false)}
        width={500}
      >
        <div style={{ marginBottom: 8 }}>
          <Space>
            <Button size="small" onClick={() => setCheckedKeys(getAllKeys(permTree))}>全选</Button>
            <Button size="small" onClick={() => setCheckedKeys([])}>清空</Button>
          </Space>
        </div>
        <Tree
          checkable
          fieldNames={{ title: 'name', key: 'id', children: 'children' }}
          treeData={permTree as any}
          checkedKeys={checkedKeys}
          expandedKeys={expandedKeys}
          onCheck={(keys: any) => setCheckedKeys(keys as number[])}
          onExpand={(keys: any[]) => setExpandedKeys(keys as number[])}
        />
      </Modal>
    </div>
  )
}
