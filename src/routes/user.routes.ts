import { Router } from 'express'
import { UserController } from '../controllers/user.controllers'
import { authentication, isAdmin } from '~/middlewares/auth.middleware'
import { validateUpdatUserBySelf, validateUserByAdmin } from '~/middlewares/user.validation'
import { handleValidationErrors } from '~/middlewares/validation'
const router = Router()

router.get('/', authentication, isAdmin, UserController.handleGetAllUsers)
router.get('/get:id', authentication, UserController.getUserById)
router.put('/update-by-self', authentication, validateUpdatUserBySelf(), handleValidationErrors, UserController.handleUpdateUserBySelf)
router.put('/update/:id', authentication, isAdmin, validateUserByAdmin(), handleValidationErrors, UserController.handleUpdateUserByAdmin)
router.delete('/delete/:id', authentication, isAdmin, UserController.handleDeleteUser)
router.post('/create-user', UserController.handleCreateUserByAdmin)

export default router
