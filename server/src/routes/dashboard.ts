import { Router } from 'express'
import { stats } from '../controllers/dashboard'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/stats', stats)

export default router
