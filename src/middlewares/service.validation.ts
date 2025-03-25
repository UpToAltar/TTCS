import { body, ValidationChain } from "express-validator";

export const validateAddService = (): ValidationChain[] => [
  body('name').trim().notEmpty().withMessage('Tên dịch vụ không được để trống'),

  body('price')
    .notEmpty()
    .withMessage('Giá dịch vụ không được để trống')
    .isNumeric()
    .withMessage('Giá dịch vụ phải là số')
]
