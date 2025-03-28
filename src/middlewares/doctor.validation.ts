import { body, ValidationChain } from "express-validator";

export const validateAddService = (): ValidationChain[] => [
    body('name').trim().notEmpty().withMessage('Tên chuyên ngành không được để trống'),


]
