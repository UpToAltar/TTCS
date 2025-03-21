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
  static async handleGetAllUsers(req: Request, res: Response) {
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
   * /api/users:
   *   post:
   *     summary: Thêm mới người dùng
   *     description: Tạo mới một người dùng với dữ liệu đầu vào
   *     responses:
   *       201:
   *         description: Tạo thành công
   */
  static async handleCreateNewUser(req: Request, res: Response) {
    try {

      const newUser = await UserService.createNewUser(req.body);
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
  static async handleUpdateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.updateUser(id, req.body);

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
  static async handleDeleteUser(req: Request, res: Response): Promise<void> {
    try {
      const deletedUser = await UserService.deleteUser(req.params.id);
      res.status(HttpStatus.OK).json(apiResponse(HttpStatus.OK, "Xóa người dùng thành công", deletedUser));
    } catch (error: any) {
      if (error.message === "Người dùng không tồn tại") {
        res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, error.message, null, true));
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ", null, true));
      }
    }
  }
}
