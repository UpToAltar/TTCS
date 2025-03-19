import { Router } from 'express'
import { AuthController } from '~/controllers/auth.controllers'
import { handleValidationErrors, validateLogin, validateRegister } from '~/middlewares/validation'

const router = Router()
router.post('/register', validateRegister(), handleValidationErrors, AuthController.register)
router.get('/verify-email', AuthController.verifyEmail)
router.post('/login', validateLogin(), handleValidationErrors, AuthController.login)

export default router
