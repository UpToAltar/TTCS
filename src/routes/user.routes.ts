import { Router } from 'express'
import { UserController } from '../controllers/user.controllers'
import { authentication, isAdmin } from '~/middlewares/auth.middleware'
import { validateUpdatUserBySelf, validateUserByAdmin } from '~/middlewares/user.validation'
import { handleValidationErrors } from '~/middlewares/validation'
const router = Router()

router.get('/get-all', authentication, isAdmin, UserController.handleGetAllUsers)
router.post('/update-by-self', authentication, validateUpdatUserBySelf(), handleValidationErrors, UserController.handleUpdateUserBySelf)
router.put('/update/:phone', authentication, isAdmin, validateUserByAdmin(), handleValidationErrors, UserController.handleUpdateUserByAdmin)
router.delete('/delete/:phone', authentication, isAdmin, UserController.handleDeleteUser)
router.post('/create-user', authentication, isAdmin, validateUserByAdmin(), handleValidationErrors, UserController.handleCreateUserByAdmin)

export default router
