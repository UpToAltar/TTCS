import { Router } from 'express'
import { AuthController } from '~/controllers/auth.controllers'
import { handleValidationErrors, validateRegister } from '~/middlewares/validation'

const router = Router()
router.post('/register', validateRegister(), handleValidationErrors, AuthController.register)

export default router
