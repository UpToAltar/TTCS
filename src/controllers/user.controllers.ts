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
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Lấy thông tin người dùng theo ID
   *     description: Trả về thông tin chi tiết của một người dùng dựa trên ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID của người dùng cần lấy
   *     responses:
   *       200:
   *         description: Thành công
   *       404:
   *         description: Không tìm thấy người dùng
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", null, true));
      }
      res.json(apiResponse(HttpStatus.OK, "Lấy thông tin người dùng thành công", user));
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true));
    }
  }

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Tạo mới người dùng
   *     description: Tạo mới một người dùng với dữ liệu đầu vào
   *     responses:
   *       201:
   *         description: Tạo thành công
   */
  static async createUser(req: Request, res: Response) {
    try {
      const newUser = await UserService.createUser(req.body);
      res.status(HttpStatus.CREATED).json(apiResponse(HttpStatus.CREATED, "Tạo người dùng thành công", newUser));
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true));
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Cập nhật thông tin người dùng
   *     description: Cập nhật dữ liệu của một người dùng dựa trên ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID của người dùng cần cập nhật
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   *       404:
   *         description: Không tìm thấy người dùng
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const updatedUser = await UserService.updateUser(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", null, true));
      }
      res.json(apiResponse(HttpStatus.OK, "Cập nhật thông tin người dùng thành công", updatedUser));
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true));
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Xóa người dùng
   *     description: Xóa một người dùng dựa trên ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID của người dùng cần xóa
   *     responses:
   *       200:
   *         description: Xóa thành công
   *       404:
   *         description: Không tìm thấy người dùng
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const deletedUser = await UserService.deleteUser(req.params.id);
      if (!deletedUser) {
        return res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", null, true));
      }
      res.json(apiResponse(HttpStatus.OK, "Xóa người dùng thành công", deletedUser));
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true));
    }
  }
}
