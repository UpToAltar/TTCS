import { Router } from 'express'
import { AppointmentController } from '~/controllers/appointment.controller'
import { authentication, isAdmin, isAdminOrDoctor } from '~/middlewares/auth.middleware'
import { handleValidationErrors } from '~/middlewares/validation'
import { validateAddAppointment, validateUpdateAppointment } from '~/middlewares/appointment.validation'

const router = Router()
router.post(
  '/add',
  authentication,
  isAdminOrDoctor,
  validateAddAppointment(),
  handleValidationErrors,
  AppointmentController.addAppointment
)
router.get('/', authentication, isAdminOrDoctor, AppointmentController.getAllAppointment)
router.get('/:id', authentication, isAdminOrDoctor, AppointmentController.getAppointmentById)
router.put(
  '/update/:id',
  authentication,
  isAdminOrDoctor,
  validateUpdateAppointment(),
  handleValidationErrors,
  AppointmentController.updateAppointment
)
router.delete('/delete/:id', authentication, isAdminOrDoctor, AppointmentController.deleteAppointment)

export default router
