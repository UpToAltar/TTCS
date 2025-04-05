import { body, ValidationChain } from "express-validator";

export const validateUpdateDoctor = (): ValidationChain[] => [
  body('namespecial').trim().notEmpty().withMessage('Tên chuyên ngành không được để trống'),

  body('degree').trim().notEmpty().withMessage('Bằng cấp không được để trống'),

  body('description').trim().notEmpty().withMessage('Tên chuyên ngành không được để trống')
]
