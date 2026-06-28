import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../utils/prisma'
import { success, fail, paginate } from '../utils/response'

export async function list(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const keyword = (req.query.keyword as string) || ''

  const where: any = {}
  if (keyword) {
    where.OR = [
      { phone: { contains: keyword } },
      { nickname: { contains: keyword } },
    ]
  }

  const [list, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        gender: true,
        birthday: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.member.count({ where }),
  ])

  // 批量查询每个会员的订单数（Order.userId 对应 Member.id）
  const memberIds = list.map(m => m.id)
  const orderCounts = await prisma.order.groupBy({
    by: ['userId'],
    where: { userId: { in: memberIds } },
    _count: { id: true },
  })
  const countMap = new Map(orderCounts.map(o => [o.userId, o._count.id]))

  const data = list.map(m => ({
    ...m,
    orderCount: countMap.get(m.id) || 0,
  }))

  return paginate(res, data, total, page, pageSize)
}

export async function getById(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      id: true,
      phone: true,
      nickname: true,
      avatar: true,
      gender: true,
      birthday: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!member) {
    return fail(res, '会员不存在')
  }

  const orderCount = await prisma.order.count({ where: { userId: id } })

  return success(res, { ...member, orderCount })
}

export async function create(req: Request, res: Response) {
  const { phone, password, nickname, avatar, gender, birthday, status } = req.body

  if (!phone || !password) {
    return fail(res, '手机号和密码不能为空')
  }

  // 校验手机号格式
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return fail(res, '手机号格式不正确')
  }

  const exist = await prisma.member.findUnique({ where: { phone } })
  if (exist) {
    return fail(res, '手机号已存在')
  }

  const hashed = await bcrypt.hash(password, 10)
  const member = await prisma.member.create({
    data: {
      phone,
      password: hashed,
      nickname: nickname || `用户${phone.slice(-4)}`,
      avatar,
      gender: gender ?? 0,
      birthday: birthday ? new Date(birthday) : undefined,
      status: status ?? 1,
    },
    select: { id: true, phone: true, nickname: true },
  })

  return success(res, member, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const { phone, password, nickname, avatar, gender, birthday, status } = req.body

  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) {
    return fail(res, '会员不存在')
  }

  // 如果修改手机号，检查唯一性
  if (phone && phone !== member.phone) {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return fail(res, '手机号格式不正确')
    }
    const exist = await prisma.member.findUnique({ where: { phone } })
    if (exist) {
      return fail(res, '手机号已存在')
    }
  }

  const data: any = {}
  if (phone !== undefined) data.phone = phone
  if (nickname !== undefined) data.nickname = nickname
  if (avatar !== undefined) data.avatar = avatar
  if (gender !== undefined) data.gender = gender
  if (birthday !== undefined) data.birthday = birthday ? new Date(birthday) : null
  if (status !== undefined) data.status = status
  if (password) data.password = await bcrypt.hash(password, 10)

  await prisma.member.update({ where: { id }, data })

  return success(res, null, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = parseInt(req.params.id)

  const member = await prisma.member.findUnique({ where: { id } })
  if (!member) {
    return fail(res, '会员不存在')
  }

  const orderCount = await prisma.order.count({ where: { userId: id } })
  if (orderCount > 0) {
    return fail(res, `该会员有 ${orderCount} 笔订单，无法删除`)
  }

  await prisma.member.delete({ where: { id } })

  return success(res, null, '删除成功')
}
