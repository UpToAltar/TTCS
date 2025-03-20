import { Router } from 'express'
import { AuthController } from '~/controllers/auth.controllers'
import {
  handleValidationErrors,
  validateChangePassword,
  validateLogin,
  validateRegister
} from '~/middlewares/validation'

const router = Router()
router.post('/register', validateRegister(), handleValidationErrors, AuthController.register)
router.get('/verify-email', AuthController.verifyEmail)
router.post('/login', validateLogin(), handleValidationErrors, AuthController.login)
router.get('/send-email-reset-password', AuthController.sendEmailResetPassword)
router.post('/change-password', validateChangePassword(), handleValidationErrors, AuthController.changePassword)

export default router
