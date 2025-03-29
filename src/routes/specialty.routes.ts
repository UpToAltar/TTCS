import { Router } from 'express'
import { SpecialtyController } from '../controllers/specialty.controller'
import upload from '~/middlewares/upload.middleware'

const router = Router()

router.post('/add', upload.single('file'), SpecialtyController.createSpecialty)
router.get('/', SpecialtyController.getAllSpecialties)
router.get('/:id', SpecialtyController.getSpecialtyById)
router.put('/update/:id', upload.single('file'), SpecialtyController.updateSpecialty)
router.delete('/delete/:id', SpecialtyController.deleteSpecialty)

export default router
