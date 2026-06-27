import { Response } from 'express'

export function success(res: Response, data: any = null, message = 'ok') {
  return res.json({ code: 0, message, data })
}

export function fail(res: Response, message = 'error', code = -1, status = 200) {
  return res.status(status).json({ code, message, data: null })
}

export function paginate(res: Response, list: any[], total: number, page: number, pageSize: number) {
  return res.json({
    code: 0,
    message: 'ok',
    data: { list, total, page, pageSize },
  })
}
