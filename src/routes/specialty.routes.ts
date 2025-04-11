import { Router } from 'express'
import { SpecialtyController } from '../controllers/specialty.controller'
import upload from '~/middlewares/upload.middleware'
import { authentication } from '~/middlewares/auth.middleware'

const router = Router()

router.post('/add', authentication, upload.single('file'), SpecialtyController.createSpecialty)
router.get('/', SpecialtyController.getAllSpecialties)
router.get('/:id', SpecialtyController.getSpecialtyById)
router.put('/update/:id', authentication, upload.single('file'), SpecialtyController.updateSpecialty)
router.delete('/delete/:id', authentication, SpecialtyController.deleteSpecialty)

router.get('/getAllDoctor/:id', SpecialtyController.getDoctorBySpecialtyId)
export default router
