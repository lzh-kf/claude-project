import { Router } from 'express'
import { tree, list, create, update, remove } from '../controllers/permissions'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/permission'

const router = Router()

router.use(authMiddleware)

router.get('/tree', tree)
router.get('/', list)
router.post('/', requirePermission('perm:create'), create)
router.put('/:id', requirePermission('perm:update'), update)
router.delete('/:id', requirePermission('perm:delete'), remove)

export default router
