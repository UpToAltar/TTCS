import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { updateUserBySelfType, updateUserByAdminType, createNewUserType } from '~/type/user.type'

export class UserController {
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Lấy danh sách người dùng
   *     description: Trả về danh sách tất cả người dùng
   *     tags:
   *       - User  
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
      const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'DESC' } = req.query

      const result = await UserService.getUsers(
        Number(page),
        Number(limit),
        String(search),
        String(sort),
        String(order)
      )

      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách người dùng thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/users/update-by-self:
   *   put:
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
  static async handleUpdateUserBySelf(req: Request, res: Response) {
    try {

      const userId = req.user?.id;

      const updateData: updateUserBySelfType = req.body
      const updatedUser = await UserService.updateUserBySelf(userId, updateData);


      if (!updatedUser) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json(apiResponse(HttpStatus.NOT_FOUND, 'Không tìm thấy người dùng', null, true))
        return
      }
      res
        .status(HttpStatus.OK)
        .json(apiResponse(HttpStatus.OK, 'Cập nhật thông tin người dùng thành công', updatedUser))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Lỗi máy chủ', null, true))
    }
  }

  /**
   * @swagger
   * /api/users/update/{id}:
   *   put:
   *     summary: Cập nhật thông tin người dùng
   *     description: Admin có thể cập nhật dữ liệu người dùng, bao gồm cả vai trò
   *     tags:
   *       - User
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
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
   *               rolename:
   *                 type: string
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       404:
   *         description: Không tìm thấy người dùng hoặc vai trò
   *       500:
   *         description: Lỗi máy chủ
   */
  static async handleUpdateUserByAdmin(req: Request, res: Response) {
    try {
      const { phone } = req.params;
      const userData: updateUserByAdminType = req.body;
      if (!phone) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          apiResponse(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ", null, true)
        )
      }
      const updatedUser = await UserService.updateUserByAdmin(phone as string, userData)

      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng hoặc vai trò", null, true));
      }

      return res.status(HttpStatus.OK).json(apiResponse(HttpStatus.OK, "Cập nhật thông tin người dùng thành công", updatedUser));
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ", null, true));
    }
  }

  /**
   * @swagger
   * /api/users/delete/{id}:
   *   delete:
   *     summary: Xóa người dùng
   *     description: Xóa một người dùng dựa trên số điện thoại
   *     tags:
   *       - User
   *     parameters:
   *       - in: query
   *         name: id
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
      const { id } = req.params
      if (!id)

        res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, 'Người dùng không tồn tại', null, true))
      const deletedUser = await UserService.deleteUser(id as string)
      res.status(HttpStatus.OK).json(apiResponse(HttpStatus.OK, 'Xóa người dùng thành công', deletedUser))

    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Lỗi máy chủ', null, true))
    }
  }

  /**
 * @swagger
 * /api/users/create-user:
 *   post:
 *     summary: Tạo người dùng mới bởi admin
 *     description: Admin có thể tạo tài khoản người dùng mới
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
 *               rolename:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo người dùng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc đã tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */
  static async handleCreateUserByAdmin(req: Request, res: Response) {
    try {
      const userData: createNewUserType = req.body;
      const newUser = await UserService.creatUserbyAdmin(userData);
      res.status(HttpStatus.CREATED).json(apiResponse(HttpStatus.CREATED, "Tạo người dùng thành công", newUser));
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true));
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Lấy chi tiết người dùng
   *     description: API để lấy thông tin chi tiết của một người dùng
   *     tags:
   *       - User
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của người dùng cần lấy thông tin
   *     responses:
   *       200:
   *         description: Trả về thông tin người dùng thành công
   *       404:
   *         description: Người dùng không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await UserService.getUserById(id)
      if (!result) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Người dùng không tồn tại', null, true))
      } else {
        res.json(apiResponse(HttpStatus.OK, 'Lấy thông tin gười dùng thành công', result))
      }
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
