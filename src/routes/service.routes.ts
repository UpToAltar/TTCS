import { Router } from 'express'
import { ServiceController } from '~/controllers/service.controllers'
import { authentication, isAdmin } from '~/middlewares/auth.middleware'
import { validateAddService } from '~/middlewares/service.validation'
import { handleValidationErrors } from '~/middlewares/validation'

const router = Router()
router.post('/add', authentication, isAdmin, validateAddService(), handleValidationErrors, ServiceController.addService)
router.get('/', authentication, ServiceController.getAllServices)
router.get('/:id', authentication ,ServiceController.getServiceById)
router.put('/update/:id', authentication, isAdmin, ServiceController.updateService)
router.delete('/delete/:id', authentication, isAdmin, ServiceController.deleteService)

export default router
