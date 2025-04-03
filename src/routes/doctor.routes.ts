import { Router } from 'express';
import { DoctorController } from '~/controllers/doctor.controllers';
import { authentication, isAdmin } from '~/middlewares/auth.middleware';
import { validateAddDoctor } from '~/middlewares/doctor.validation';
const router = Router();

router.get('/', authentication, isAdmin, DoctorController.getAllDoctors);
router.get('/:id', authentication, DoctorController.getDoctorById);
router.put('/update-by-self', authentication, validateAddDoctor(), DoctorController.UpdateDoctorBySelf);
router.put('/update-by-admin/:id', authentication, isAdmin, validateAddDoctor(), DoctorController.UpdateDoctorByAdmin);
router.delete('/delete/:id', authentication, isAdmin, DoctorController.handleDeleteUser);

export default router;