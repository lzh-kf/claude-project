import { Router } from 'express'
import { list, getById, updateStatus } from '../controllers/orders'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/permission'

const router = Router()

router.use(authMiddleware)

router.get('/', requirePermission('order:view'), list)
router.get('/:id', requirePermission('order:view'), getById)
router.put('/:id/status', requirePermission('order:update'), updateStatus)

export default router
