import { body, ValidationChain } from 'express-validator'

export const validateAddRecord = (): ValidationChain[] => [
  body('diagnosis').trim().notEmpty().withMessage('Chẩn đoán không được để trống'),
  body('prescription').trim().notEmpty().withMessage('Đơn thuốc không được để trống'),
  body('notes').trim().notEmpty().withMessage('Ghi chú không được để trống'),
  body('medicalAppointmentId').trim().notEmpty().withMessage('Id Cuộc hẹn không được để trống'),
]

export const validateUpdateRecord = (): ValidationChain[] => [
  body('diagnosis').trim().notEmpty().withMessage('Chẩn đoán không được để trống'),
  body('prescription').trim().notEmpty().withMessage('Đơn thuốc không được để trống'),
  body('notes').trim().notEmpty().withMessage('Ghi chú không được để trống')
]
