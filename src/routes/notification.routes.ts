import { Router } from 'express'
import { NotificationController } from '~/controllers/notification.controllers'
import { authentication, isAdmin, isAdminOrDoctor } from '~/middlewares/auth.middleware'
import { validateAddNotification } from '~/middlewares/notification.validation'
import { handleValidationErrors } from '~/middlewares/validation'

const router = Router()
router.post('/add', validateAddNotification(), handleValidationErrors, NotificationController.addNotification)
router.get('/', authentication, NotificationController.getAllNotifications)
router.get('/:id', authentication, NotificationController.getNotificationById)
router.delete('/delete/:id', NotificationController.deleteNotification)

export default router
