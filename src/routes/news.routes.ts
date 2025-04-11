import { Router } from 'express'
import upload from '~/middlewares/upload.middleware'
import { NewsController } from '~/controllers/news.controllers'
import { authentication, isAdminOrDoctor } from '~/middlewares/auth.middleware'

const router = Router()

router.post('/add', authentication, isAdminOrDoctor, upload.single('file'), NewsController.createNews)
router.get('/', NewsController.getAllNews)
router.get('/:id', NewsController.getNewsById)
router.put('/update/:id', authentication, isAdminOrDoctor, upload.single('file'), NewsController.updateNews)
router.delete('/delete/:id', authentication, isAdminOrDoctor, NewsController.deleteNews)

export default router
