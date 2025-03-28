import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import serviceRoutes from './service.routes'
import doctorRoutes from './doctor.routes'
const router = Router()

router.use('/users', userRoutes)
router.use('/auth', authRoutes)
router.use('/service', serviceRoutes)
router.use('/doctors', doctorRoutes)

export default router
