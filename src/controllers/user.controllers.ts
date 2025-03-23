import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { updateUserType } from '~/type/user.type'

export class UserController {
  /**
   * @swagger
   * /api/user/get-all:
   *   get:
   *     summary: Lấy danh sách người dùng
   *     description: Trả về danh sách tất cả người dùng
   *     tags:
   *       - User  
   *     responses:
   *       200:
   *         description: Thành công
   */
  static async handleGetAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getUsers()
      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách người dùng thành công', users))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/user/update:
   *   post:
   *     summary: Cập nhật thông tin người dùng
   *     description: Cập nhật dữ liệu người dùng
   *     tags:
   *       - User
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
   *               birthDate:
   *                 type: string
   *               gender:
   *                 type: boolean
   *               address:
   *                 type: string
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   *       404:
   *         description: Không tìm thấy người dùng
   */
  static async handleUpdateUser(req: Request, res: Response) {
    try {
      const user: updateUserType = req.body
      const updatedUser = await UserService.updateUser(user);

      if (!updatedUser) {
        res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", null, true));
        return;
      }
      res.status(HttpStatus.OK).json(apiResponse(HttpStatus.OK, "Cập nhật thông tin người dùng thành công", updatedUser));
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ", null, true));
    }
  }

  /**
   * @swagger
   * /api/user/delete:
   *   delete:
   *     summary: Xóa người dùng
   *     description: Xóa một người dùng dựa trên số điện thoại
   *     tags:
   *       - User
   *     parameters:
   *       - in: query
   *         name: phone
   *         schema:
   *           type: string
   *         required: true
   *         description: Số điện thoại người dùng
   *     responses:
   *       200:
   *         description: Xóa thành công
   *       404:
   *         description: Không tìm thấy người dùng
   *       500:
   *         description: Lỗi máy chủ
   */

  static async handleDeleteUser(req: Request, res: Response) {
    try {
      const { phone } = req.query
      if (!phone)
        res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", null, true));
      const deletedUser = await UserService.deleteUser(phone as string);
      res.status(HttpStatus.OK).json(apiResponse(HttpStatus.OK, "Xóa người dùng thành công", deletedUser));
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ", null, true));
    }
  }
}

