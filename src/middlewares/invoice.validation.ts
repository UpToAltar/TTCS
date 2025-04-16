import { body, ValidationChain } from 'express-validator'

export const validateAddInvoice = (): ValidationChain[] => [
  body('appointmentId').trim().notEmpty().withMessage('Mã cuộc hẹn không được để trống'),

  body('status')
    .notEmpty()
    .withMessage('Trạng thái không được để trống')
    .isIn(['Đã thanh toán', 'Chưa thanh toán'])
    .withMessage('Trạng thái không hợp lệ, vui lòng chọn (Đã thanh toán) hoặc (Chưa thanh toán)'),

  body('note').trim().notEmpty().withMessage('Ghi chú không được để trống')
]

export const validateUpdateInvoice = (): ValidationChain[] => [
  body('total')
    .trim()
    .notEmpty()
    .withMessage('Tổng tiền không được để trống')
    .isNumeric()
    .withMessage('Tổng tiền phải là số'),

  body('status')
    .notEmpty()
    .withMessage('Trạng thái không được để trống')
    .isIn(['Đã thanh toán', 'Chưa thanh toán'])
    .withMessage('Trạng thái không hợp lệ, vui lòng chọn (Đã thanh toán) hoặc (Chưa thanh toán)'),

  body('note').trim().notEmpty().withMessage('Ghi chú không được để trống')
]
