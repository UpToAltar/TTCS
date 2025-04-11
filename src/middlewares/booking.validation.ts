import { body, ValidationChain } from 'express-validator'

export const validateAddBooking = (): ValidationChain[] => [
  body('timeSlotId').trim().notEmpty().withMessage('Mã khung giờ không được để trống'),

  body('serviceId').trim().notEmpty().withMessage('Mã dịch vụ không được để trống'),

]
