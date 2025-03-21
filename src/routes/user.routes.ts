import { Router } from 'express'
import { UserController } from '../controllers/user.controllers'
import { authentication, isAdmin } from '~/middlewares/auth.middleware'

const router = Router()

router.get('/get-all-users', authentication, isAdmin, UserController.handleGetAllUsers)
router.post('/create-new-user', authentication, UserController.handleCreateNewUser)
router.put('/update-user', authentication, UserController.handleUpdateUser)
router.delete('/delete-user', authentication, isAdmin, UserController.handleDeleteUser)
export default router
