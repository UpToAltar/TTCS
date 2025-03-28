import { Router } from 'express';
import { DoctorController } from '~/controllers/doctor.controllers';
import { authentication, isAdmin } from '~/middlewares/auth.middleware';

const router = Router();

router.get('/', authentication, DoctorController.getAllDoctors);

export default router;