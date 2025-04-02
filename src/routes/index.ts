import { Router } from 'express'
import userRoutes from './user.routes'
import authRoutes from './auth.routes'
import serviceRoutes from './service.routes'
import doctorRoutes from './doctor.routes'
import specialtyRoutes from './specialty.routes'
import newsRoutes from './news.routes'
const router = Router()

router.use('/users', userRoutes)
router.use('/auth', authRoutes)
router.use('/service', serviceRoutes)
router.use('/doctors', doctorRoutes)
router.use('/specialty', specialtyRoutes)
router.use('/news', newsRoutes)

export default router
