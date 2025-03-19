import { Router } from 'express'
import { UserController } from '../controllers/user.controllers'
import { authentication } from '~/middlewares/auth.middleware'

const router = Router()

router.get('/', authentication, UserController.getUsers)

export default router
