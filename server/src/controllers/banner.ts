import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { success, fail, paginate } from '../utils/response'

export async function list(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const keyword = (req.query.keyword as string) || ''
  const status = req.query.status as string

  const where: any = {}
  if (keyword) {
    where.title = { contains: keyword }
  }
  if (status) {
    where.status = parseInt(status)
  }

  const [listData, total] = await Promise.all([
    prisma.banner.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { sort: 'asc' },
    }),
    prisma.banner.count({ where }),
  ])

  return paginate(res, listData, total, page, pageSize)
}

export async function getById(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const banner = await prisma.banner.findUnique({ where: { id } })
  if (!banner) {
    return fail(res, 'Banner不存在')
  }
  return success(res, banner)
}

export async function create(req: Request, res: Response) {
  const { title, image, link, sort, status } = req.body
  if (!title) {
    return fail(res, '标题不能为空')
  }
  if (!image) {
    return fail(res, '图片不能为空')
  }

  const banner = await prisma.banner.create({
    data: {
      title,
      image,
      link: link || null,
      sort: sort !== undefined ? sort : 0,
      status: status !== undefined ? status : 1,
    },
  })

  return success(res, banner, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const { title, image, link, sort, status } = req.body

  const banner = await prisma.banner.findUnique({ where: { id } })
  if (!banner) {
    return fail(res, 'Banner不存在')
  }

  const data: any = {}
  if (title !== undefined) data.title = title
  if (image !== undefined) data.image = image
  if (link !== undefined) data.link = link
  if (sort !== undefined) data.sort = sort
  if (status !== undefined) data.status = status

  const updated = await prisma.banner.update({ where: { id }, data })
  return success(res, updated, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = parseInt(req.params.id)
  const banner = await prisma.banner.findUnique({ where: { id } })
  if (!banner) {
    return fail(res, 'Banner不存在')
  }

  await prisma.banner.delete({ where: { id } })
  return success(res, null, '删除成功')
}
