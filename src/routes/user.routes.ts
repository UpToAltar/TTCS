import { Router } from 'express'
import { UserController } from '../controllers/user.controllers'
import { authentication, isAdmin } from '~/middlewares/auth.middleware'

const router = Router()

router.get('/', authentication, isAdmin, UserController.getUsers)
router.get('/:id', authentication, UserController.getUserById)
router.put('/:id', authentication, UserController.updateUser)
router.delete('/:id', authentication, isAdmin, UserController.deleteUser)
export default router
