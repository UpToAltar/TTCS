import { Router } from 'express'
import { StatisticController } from '~/controllers/statistic.controller'
import { authentication, isAdminOrDoctor } from '~/middlewares/auth.middleware'

const router = Router()

router.get('/dashboard', authentication, isAdminOrDoctor, StatisticController.getTotal)
router.get('/user', authentication, isAdminOrDoctor, StatisticController.getStatisticUser)
export default router
