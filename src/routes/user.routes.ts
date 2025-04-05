import { Router } from 'express'
import { UserController } from '../controllers/user.controllers'
import { authentication, isAdmin } from '~/middlewares/auth.middleware'
import { validateUpdatUser, validateUserByAdmin } from '~/middlewares/user.validation'
import { handleValidationErrors } from '~/middlewares/validation'
const router = Router()

router.get('/', authentication, isAdmin, UserController.handleGetAllUsers)
router.get('/:id', authentication, isAdmin, UserController.getUserById)
router.put('/update-by-self', authentication, validateUpdatUser(), handleValidationErrors, UserController.handleUpdateUserBySelf)
router.put('/update/:id', authentication, isAdmin, validateUpdatUser(), handleValidationErrors, UserController.handleUpdateUserByAdmin)
router.delete('/delete/:id', authentication, isAdmin, UserController.handleDeleteUser)
router.post('/create-user', authentication, isAdmin, validateUserByAdmin(), handleValidationErrors, UserController.handleCreateUserByAdmin)

export default router
