import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, Tag, Popconfirm, message, Switch, DatePicker } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ManOutlined, WomanOutlined, QuestionOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { getMembers, createMember, updateMember, deleteMember, type Member } from '../../api/members'

export default function MembersPage() {
  const [data, setData] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  // 模态框状态
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [form] = Form.useForm()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMembers({ page, pageSize, keyword })
      setData(res.list)
      setTotal(res.total)
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [page, pageSize, keyword])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditingMember(null)
    form.resetFields()
    form.setFieldsValue({ gender: 0, status: 1 })
    setModalOpen(true)
  }

  const openEdit = (member: Member) => {
    setEditingMember(member)
    form.setFieldsValue({
      phone: member.phone,
      nickname: member.nickname,
      gender: member.gender,
      status: member.status === 1,
      birthday: member.birthday ? dayjs(member.birthday) : undefined,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      status: values.status ? 1 : 0,
      birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
    }

    try {
      if (editingMember) {
        await updateMember(editingMember.id, payload)
        message.success('更新成功')
      } else {
        await createMember(payload)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMember(id)
      message.success('删除成功')
      fetchData()
    } catch { /* handled */ }
  }

  const genderOptions = [
    { label: '保密', value: 0 },
    { label: '男', value: 1 },
    { label: '女', value: 2 },
  ]

  const columns: ColumnsType<Member> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '昵称', dataIndex: 'nickname', render: v => v || '-' },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 70,
      render: (v: number) => {
        if (v === 1) return <Tag icon={<ManOutlined />} color="blue">男</Tag>
        if (v === 2) return <Tag icon={<WomanOutlined />} color="pink">女</Tag>
        return <Tag icon={<QuestionOutlined />}>保密</Tag>
      },
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      width: 80,
      render: (v: number) => v ?? 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => v === 1 ? <Tag color="green">正常</Tag> : <Tag color="red">禁用</Tag>,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 200,
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
        <Space.Compact>
          <Input
            placeholder="搜索手机号/昵称"
            prefix={<SearchOutlined />}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={() => { setKeyword(inputValue); setPage(1) }}
            allowClear
            onClear={() => { setInputValue(''); setKeyword(''); setPage(1) }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => { setKeyword(inputValue); setPage(1) }}>搜索</Button>
        </Space.Compact>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增会员</Button>
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
        title={editingMember ? '编辑会员' : '新增会员'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editingMember ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingMember ? '留空则不修改' : '请输入密码'} />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" maxLength={30} />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select options={genderOptions} />
          </Form.Item>
          <Form.Item name="birthday" label="生日">
            <DatePicker style={{ width: '100%' }} placeholder="请选择生日" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="正常" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
