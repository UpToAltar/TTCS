import { Router } from 'express'
import { UserController } from '../controllers/user.controllers'
import { authentication, isAdmin } from '~/middlewares/auth.middleware'

const router = Router()

router.get('/get-all', authentication, isAdmin, UserController.handleGetAllUsers)
router.post('/update', UserController.handleUpdateUser)
router.delete('/delete', authentication, isAdmin, UserController.handleDeleteUser)

export default router
