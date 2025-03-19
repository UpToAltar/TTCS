import { body, ValidationChain, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'
import { HttpStatus } from '~/utils/httpStatus'

/**
 * Middleware kiểm tra dữ liệu đăng ký
 */
export const validateRegister = (): ValidationChain[] => [
  body('userName')
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

  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Xác nhận mật khẩu không được để trống')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Mật khẩu xác nhận không khớp')
      }
      return true
    })
]

export const validateLogin = (): ValidationChain[] => [
  body('emailOrPhone').trim().notEmpty().withMessage('Email hoặc số điện thoại không được để trống'),

  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
]

/**
 * Middleware xử lý lỗi validation
 */
export const handleValidationErrors: any = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Dữ liệu nhập vào không hợp lệ',
      errors: errors.array().map((err) => ({ field: err.type, message: err.msg })),
      error: true
    })
  }
  next()
}
