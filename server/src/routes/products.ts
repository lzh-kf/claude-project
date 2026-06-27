import { Router } from 'express'
import { list, getById, create, update, remove } from '../controllers/products'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/permission'

const router = Router()

router.use(authMiddleware)

router.get('/', requirePermission('product:view'), list)
router.get('/:id', requirePermission('product:view'), getById)
router.post('/', requirePermission('product:create'), create)
router.put('/:id', requirePermission('product:update'), update)
router.delete('/:id', requirePermission('product:delete'), remove)

export default router
