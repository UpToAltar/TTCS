import { Router } from 'express'
import { BookingController } from '~/controllers/booking.controllers'
import { authentication, isAdmin, isAdminOrDoctor, } from '~/middlewares/auth.middleware'
import { validateAddBooking } from '~/middlewares/booking.validation'
import { handleValidationErrors } from '~/middlewares/validation'

const router = Router()

router.post('/add', authentication, validateAddBooking(), handleValidationErrors, BookingController.addBooking)
router.get('/verify-email', BookingController.verifyBooking)
router.post('/cancel/:id', authentication, BookingController.requestCancelBooking)
router.get('/verify-cancel-email', BookingController.verifyCancelBooking)
router.get('/', authentication, BookingController.getAllBookings)
router.get('/:id', authentication, BookingController.getBookingById)

export default router
