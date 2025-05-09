import { Router } from 'express'
import { StatisticController } from '~/controllers/statistic.controller'
import { authentication, isAdminOrDoctor } from '~/middlewares/auth.middleware'

const router = Router()

router.get('/dashboard', authentication, isAdminOrDoctor, StatisticController.getTotal)
router.get('/user', authentication, isAdminOrDoctor, StatisticController.getStatisticUser)
router.get('/doctor', authentication, isAdminOrDoctor, StatisticController.getStatisticDoctor)
router.get('/timeslot', authentication, isAdminOrDoctor, StatisticController.getStatisticTimeSlot)
router.post('/overview', authentication, isAdminOrDoctor, StatisticController.getOverviewStats)
router.get('/recent-activities', authentication, isAdminOrDoctor, StatisticController.getRecentActivities)

export default router
