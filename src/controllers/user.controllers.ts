import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { updateUserBySelfType } from '~/type/user.type'

export class UserController {
  /**
   * @swagger
   * /api/users/get-all:
   *   get:
   *     summary: Lấy danh sách người dùng
   *     description: Trả về danh sách tất cả người dùng
   *     tags:
   *       - Admin  
   *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng người dùng trên mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (userName, email, phone)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Trường để sắp xếp
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Lấy danh sách người dùng thành công
 *       500:
 *         description: Lỗi máy chủ
 */

  static async handleGetAllUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'DESC' } = req.query;

      const result = await UserService.getUsers(
        Number(page),
        Number(limit),
        String(search),
        String(sort),
        String(order)
      );

      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách người dùng thành công', result));
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true));
    }
  }

  /**
   * @swagger
   * /api/users/update:
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
      const user: updateUserBySelfType = req.body
      const updatedUser = await UserService.updateUserBySelf(user);

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
   * /api/users/delete:
   *   delete:
   *     summary: Xóa người dùng
   *     description: Xóa một người dùng dựa trên số điện thoại
   *     tags:
   *       - Admin
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

