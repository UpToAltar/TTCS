import { Router } from 'express'
import { RecordController } from '~/controllers/record.controller'
import { authentication, isAdmin, isAdminOrDoctor } from '~/middlewares/auth.middleware'
import { validateAddRecord, validateUpdateRecord } from '~/middlewares/record.validation'
import { handleValidationErrors } from '~/middlewares/validation'

const router = Router()
router.post(
  '/add',
  authentication,
  isAdminOrDoctor,
  validateAddRecord(),
  handleValidationErrors,
  RecordController.addRecord
)
router.get('/', authentication, isAdminOrDoctor, RecordController.getAllRecords)
router.get('/:id', authentication, isAdminOrDoctor, RecordController.getRecordById)
router.put(
  '/update/:id',
  authentication,
  isAdminOrDoctor,
  validateUpdateRecord(),
  handleValidationErrors,
  RecordController.updateRecord
)
router.delete('/delete/:id', authentication, isAdminOrDoctor, RecordController.deleteRecord)
router.get('/doctor/:id', authentication, isAdminOrDoctor, RecordController.getRecordById)

export default router
