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
export const validateContactUsNotification = (): ValidationChain[] => [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Tên người dùng không được để trống')
        .isLength({ min: 3 })
        .withMessage('Tên người dùng phải có ít nhất 3 ký tự'),
    body('email').trim().notEmpty().withMessage('Email không được để trống').isEmail().withMessage('Email không hợp lệ'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Số điện thoại không được để trống')
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại phải có 10-11 chữ số'),
    body('topic').trim().notEmpty().withMessage('Chủ đề không được bỏ trống '),
    body('content').trim().notEmpty().withMessage('Nội dung không được bỏ trống '),
]