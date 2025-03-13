import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'

export class UserController {
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Lấy danh sách người dùng
   *     description: Trả về danh sách tất cả người dùng
   *     responses:
   *       200:
   *         description: Thành công
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers()
      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách người dùng thành công', users))
    } catch (error : any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
