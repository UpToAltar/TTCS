import { body, ValidationChain } from 'express-validator'

export const validateAddAppointment = (): ValidationChain[] => [
  body('bookingId').trim().notEmpty().withMessage('Lịch không được để trống'),
]
export const validateUpdateAppointment = (): ValidationChain[] => [
  body('status').trim().notEmpty().withMessage('Trạng thái lịch hẹn không được để trống'),
]
