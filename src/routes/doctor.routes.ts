import { Router } from 'express'
import { DoctorController } from '~/controllers/doctor.controllers'
import { authentication, isAdmin, isDoctor } from '~/middlewares/auth.middleware'
import { validateUpdateDoctor } from '~/middlewares/doctor.validation'
import { handleValidationErrors } from '~/middlewares/validation'
const router = Router()

router.get('/', DoctorController.getAllDoctors)
router.get('/:id', DoctorController.getDoctorById)
router.put(
  '/update-by-self',
  authentication,
  isDoctor,
  validateUpdateDoctor(),
  handleValidationErrors,
  DoctorController.UpdateDoctorBySelf
)
router.put(
  '/update-by-admin/:id',
  authentication,
  isAdmin,
  validateUpdateDoctor(),
  handleValidationErrors,
  DoctorController.UpdateDoctorByAdmin
)
router.delete('/delete/:id', authentication, isAdmin, DoctorController.handleDeleteUser)

export default router
