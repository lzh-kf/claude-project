import { Router } from 'express'
import { list, all, getById, create, update, remove, assignPermissions } from '../controllers/roles'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/permission'

const router = Router()

router.use(authMiddleware)

router.get('/', list)
router.get('/all', all)
router.get('/:id', getById)
router.post('/', requirePermission('role:create'), create)
router.put('/:id', requirePermission('role:update'), update)
router.delete('/:id', requirePermission('role:delete'), remove)
router.put('/:id/permissions', requirePermission('role:assign-perm'), assignPermissions)

export default router
