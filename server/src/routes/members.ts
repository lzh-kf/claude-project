import { Router } from 'express'
import { list, getById, create, update, remove } from '../controllers/members'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/permission'

const router = Router()

router.use(authMiddleware)

router.get('/', list)
router.get('/:id', getById)
router.post('/', requirePermission('member:create'), create)
router.put('/:id', requirePermission('member:update'), update)
router.delete('/:id', requirePermission('member:delete'), remove)

export default router
