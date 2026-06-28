import { Router } from 'express'
import { list, getById, create, update, remove } from '../controllers/banner'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/permission'

const router = Router()

router.use(authMiddleware)

router.get('/', requirePermission('home:view'), list)
router.get('/:id', requirePermission('home:view'), getById)
router.post('/', requirePermission('home:config'), create)
router.put('/:id', requirePermission('home:config'), update)
router.delete('/:id', requirePermission('home:config'), remove)

export default router
