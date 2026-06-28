import { Request, Response } from 'express'
import path from 'path'
import { success, fail } from '../utils/response'

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    return fail(res, '请选择要上传的文件')
  }

  // 允许的图片类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(req.file.mimetype)) {
    return fail(res, '仅支持 JPG / PNG / GIF / WebP 格式')
  }

  // 文件大小限制 5MB（multer 已做初步限制，这里二次校验）
  if (req.file.size > 5 * 1024 * 1024) {
    return fail(res, '图片大小不能超过 5MB')
  }

  const filename = req.file.filename
  const ext = path.extname(req.file.originalname)
  const url = `/uploads/${filename}`

  // 返回 wangEditor 期望的格式
  return success(res, {
    url,
    alt: req.file.originalname.replace(ext, ''),
    href: url,
  }, '上传成功')
}
