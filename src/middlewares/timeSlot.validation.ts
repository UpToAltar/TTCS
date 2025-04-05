import { body, ValidationChain } from 'express-validator'
import moment from 'moment'

export const validateAddTimeSlot = (): ValidationChain[] => [
  body('doctorId').trim().notEmpty().withMessage('Mã bác sĩ không được để trống'),

  body('startDate').custom((value) => {
    if (!moment(value, 'DD/MM/YYYY HH:mm:ss', true).isValid()) {
      throw new Error('Thời gian bắt đầu phải đúng định dạng DD/MM/YYYY HH:mm:ss và là ngày hợp lệ')
    }
    return true
  }),

  body('endDate').custom((value) => {
    if (!moment(value, 'DD/MM/YYYY HH:mm:ss', true).isValid()) {
      throw new Error('Thời gian bắt đầu phải đúng định dạng DD/MM/YYYY HH:mm:ss và là ngày hợp lệ')
    }
    return true
  }),

  body('status')
    .notEmpty()
    .withMessage('Trạng thái không được để trống')
    .isBoolean()
    .withMessage('Trạng thái phải là true hoặc false')
]
