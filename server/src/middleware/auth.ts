import { Request, Response, NextFunction } from 'express'
import { verifyToken, TokenPayload } from '../utils/jwt'
import { fail } from '../utils/response'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, '未登录，请先登录', 40101, 401)
  }
  try {
    const token = header.split(' ')[1]
    req.user = verifyToken(token)
    next()
  } catch {
    return fail(res, 'token 已过期或无效', 40101, 401)
  }
}
