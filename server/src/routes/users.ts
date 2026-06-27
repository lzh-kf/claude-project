import { Router } from 'express'
import { list, create, update, remove, assignRoles } from '../controllers/users'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/permission'

const router = Router()

router.use(authMiddleware)

router.get('/', list)
router.post('/', requirePermission('user:create'), create)
router.put('/:id', requirePermission('user:update'), update)
router.delete('/:id', requirePermission('user:delete'), remove)
router.put('/:id/roles', requirePermission('user:assign-role'), assignRoles)

export default router
