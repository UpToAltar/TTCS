import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { AddServiceType } from '~/type/service.type'
import { DoctorService } from '~/services/doctor.service'
import { EditDoctorType } from '~/type/doctor.type'

export class DoctorController {
  /**
   * @swagger
   * /api/doctor:
   *   get:
   *     summary: Lấy danh sách bác sĩ
   *     description: Trả về danh sách bác sĩ 
   *     tags:
   *       - Doctor
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
   *         description: Số lượng bác sĩ trên mỗi trang
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
   *         description: Lấy danh sách bác sĩ thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getAllDoctors(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'DESC' } = req.query;

      const result = await DoctorService.getAllDoctor(
        Number(page),
        Number(limit),
        String(search),
        String(sort),
        String(order)
      );

      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách bác sĩ thành công', result));
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true));
    }
  }
  /**
   * @swagger
   * /api/doctor/{id}:
   *   get:
   *     summary: Lấy thông tin bác sĩ
   *     description: API để lấy thông tin chi tiết của một bác sĩ
   *     tags:
   *       - Doctor
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của bác sĩ cần lấy thông tin
   *     responses:
   *       200:
   *         description: Trả về thông tin bác sĩ thành công
   *       404:
   *         description: Bác sĩ không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getDoctorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.getDoctorById(id);
      if (!doctor) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(apiResponse(HttpStatus.NOT_FOUND, 'Bác sĩ không tồn tại', null, true));
      }
      return res.json(apiResponse(HttpStatus.OK, 'Lấy thông tin bác sĩ thành công', doctor));
    } catch (error: any) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true));
    }
  }
  /**
   * @swagger
   * /api/doctor/update-by-self:
   *   put:
   *     summary: Cập nhật thông tin người dùng
   *     description: Cập nhật dữ liệu người dùng
   *     tags:
   *       - Doctor
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               degree:
   *                 type: string
   *               description:
   *                 type: string
   *               namespecial:
   *                 type: string
   *     responses:  
   *       200:
   *         description: Cập nhật thành công
   *       404:
   *         description: Không tìm thấy người dùng
   *       500:
   *         description: Lỗi máy chủ
   */

  static async UpdateDoctorBySelf(req: Request, res: Response) {
    try {

      const userId = req.user?.id;
      if (!userId) {
        return res.status(HttpStatus.UNAUTHORIZED).json(
          apiResponse(HttpStatus.UNAUTHORIZED, "Unauthorized - User ID is missing", null, true)
        )
      }
      const updateData: EditDoctorType = req.body
      const updatedUser = await DoctorService.updateDoctorBySelf(userId, updateData);
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
   * /api/doctor/update-by-admin/{id}:
   *   put:
   *     summary: Cập nhật thông tin chi tiết bác sĩ
   *     description: Admin có thể cập nhật dữ liệu bác sĩ
   *     tags:
   *       - Doctor
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của bác sĩ cần cập nhật
   *     requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                degree:
   *                  type: string
   *                description:
   *                  type: string
   *                namespecial:
   *                  type: string
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       404:
   *         description: Không tìm thấy bác sĩ hoặc vai trò
   *       500:
   *         description: Lỗi máy chủ
   */
  static async UpdateDoctorByAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userData: EditDoctorType = req.body;
      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          apiResponse(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ", null, true)
        )
      }
      const updatedUser = await DoctorService.updateDoctorbyAdmin(id as string, userData)

      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, "Không tìm thấy bác sĩ hoặc vai trò", null, true));
      }

      return res.status(HttpStatus.OK).json(apiResponse(HttpStatus.OK, "Cập nhật thông tin bác sĩ thành công", updatedUser));
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ", null, true));
    }
  }
  /**
   * @swagger
   * /api/doctor/delete/{id}:
   *   delete:
   *     summary: Xóa người dùng
   *     description: Xóa một người dùng dựa trên userId
   *     tags:
   *       - Doctor
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: Id người dùng
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
      if (!id) {
        return res.status(HttpStatus.NOT_FOUND).json(apiResponse(HttpStatus.NOT_FOUND, 'Người dùng không tồn tại', null, true));
      }

      const deletedUser = await DoctorService.deleteDoctor(id as string);
      return res.status(HttpStatus.OK).json(apiResponse(HttpStatus.OK, 'Xóa người dùng thành công', deletedUser));

    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Lỗi máy chủ', null, true))
    }
  }

}
