import { Router } from 'express'
import { ServiceController } from '~/controllers/service.controllers'
import { TimeSlotController } from '~/controllers/timeSlot.controllers'
import { authentication, isAdmin, isAdminOrDoctor } from '~/middlewares/auth.middleware'
import { validateAddService } from '~/middlewares/service.validation'
import { validateAddTimeSlot } from '~/middlewares/timeSlot.validation'
import { handleValidationErrors } from '~/middlewares/validation'

const router = Router()
router.post(
  '/add',
  authentication,
  isAdminOrDoctor,
  validateAddTimeSlot(),
  handleValidationErrors,
  TimeSlotController.addTimeSlot
)
router.get('/', authentication, TimeSlotController.getTimeSlotByDoctorAndDay)
router.get('/:id', authentication, TimeSlotController.getTimeSlotById)
router.put(
  '/update/:id',
  authentication,
  isAdminOrDoctor,
  validateAddTimeSlot(),
  handleValidationErrors,
  TimeSlotController.updateTimeSlot
)
router.delete('/delete/:id', authentication, isAdminOrDoctor, TimeSlotController.deleteTimeSlot)
router.post('/createDefaultTimeSlot', authentication, isAdminOrDoctor, TimeSlotController.createDefaultTimeSlot)
router.post('/createDefaultTimeSlotOfDay', authentication, isAdminOrDoctor, TimeSlotController.createDefaultTimeSlotOfDay)
router.post(
  '/createDefaultTimeSlotForWeek',
  authentication,
  isAdminOrDoctor,
  TimeSlotController.createDefaultTimeSlotForWeek
);
router.get('/schedule/:doctorId', TimeSlotController.getDoctorScheduleDates)
export default router
