import { body, ValidationChain } from "express-validator";

export const validateAddNotification = (): ValidationChain[] => [
    body('title').trim().notEmpty().withMessage('Tên tiêu đề không được bỏ trống'),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Nội dung không được để trống '),

    body('userId')
        .trim()
        .notEmpty()
        .withMessage('Không được để trống '),
]
