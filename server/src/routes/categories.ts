import { Router } from 'express'
import { tree, list, create, update, remove } from '../controllers/categories'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/permission'

const router = Router()

router.use(authMiddleware)

router.get('/tree', requirePermission('category:view'), tree)
router.get('/', requirePermission('category:view'), list)
router.post('/', requirePermission('category:create'), create)
router.put('/:id', requirePermission('category:update'), update)
router.delete('/:id', requirePermission('category:delete'), remove)

export default router
