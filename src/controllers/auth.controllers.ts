import { Request, RequestHandler, Response } from 'express'
import { UserService } from '../services/user.service'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { ChangePasswordType, LoginType, RegisterType } from '~/type/auth.type'
import { AuthService } from '~/services/auth.service'
import { validateEmail } from '~/utils/mail'

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API xác thực người dùng
 */

export class AuthController {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Đăng ký tài khoản
   *     description: Đăng ký tài khoản người dùng mới
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userName:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               password:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *     responses:
   *       201:
   *         description: Đăng ký thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */

  static async register(req: Request, res: Response) {
    try {
      const user: RegisterType = req.body
      const result: any = await AuthService.registerService(user)
      res.json(apiResponse(HttpStatus.CREATED, 'Đăng kí thành công, vui lòng kích hoạt tài khoản qua email', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Đăng nhập
   *     description: Đăng nhập tài khoản người dùng
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               emailOrPhone:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Đăng nhập thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */

  static async login(req: Request, res: Response) {
    try {
      const body: LoginType = req.body
      const result: any = await AuthService.loginService(body)
      res.json(apiResponse(HttpStatus.OK, 'Đăng nhập thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/auth/verify-email:
   *   get:
   *     summary: Xác nhận email đăng ký
   *     description: Xác nhận tài khoản khi người dùng nhấn vào link xác thực trong email.
   *     tags:
   *       - Auth
   *     parameters:
   *       - in: query
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Mã xác thực email được gửi qua email
   *     responses:
   *       200:
   *         description: Xác thực thành công
   *       400:
   *         description: Token không hợp lệ hoặc tài khoản đã được xác nhận
   *       500:
   *         description: Lỗi máy chủ
   */
  static verifyEmail: any = async (req: Request, res: Response) => {
    try {
      const { token } = req.query

      if (!token) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Token không hợp lệ', null, true))
      }

      // Gọi service để xác thực email
      const result = await AuthService.verifyEmail(token as string)

      res.json(apiResponse(HttpStatus.OK, 'Email đã được xác thực thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/auth/send-email-reset-password:
   *   get:
   *     summary: Gửi mail đổi mật khẩu
   *     description: Gửi email lấy OTP đổi mật khẩu.
   *     tags:
   *       - Auth
   *     parameters:
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *         required: true
   *         description: Mã xác thực OTP được gửi qua email
   *     responses:
   *       200:
   *         description: Gửi OTP thành công
   *       400:
   *         description: Email không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */
  static sendEmailResetPassword: any = async (req: Request, res: Response) => {
    try {
      const { email } = req.query

      if (!email || !validateEmail(email as string)) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Email không hợp lệ', null, true))
      }

      // Gọi service để xác thực email
      const result = await AuthService.sendEmailResetPassword(email as string)

      res.json(apiResponse(HttpStatus.OK, 'Đã gửi OTP đến email', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/auth/change-password:
   *   post:
   *     summary: Đổi mật khẩu
   *     description: Đổi mật khẩu với mã xác thực gửi về mail
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               code:
   *                 type: string
   *               password:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *     responses:
   *       201:
   *         description: Đổi mật khẩu thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */

  static async changePassword(req: Request, res: Response) {
    try {
      const body: ChangePasswordType = req.body
      const result: any = await AuthService.changePasswordService(body)
      res.json(apiResponse(HttpStatus.OK, 'Đổi mật khẩu thành công, vui lòng đăng nhập lại', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
