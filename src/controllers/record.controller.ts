import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { CreateRecordType } from '~/type/record.type'
import { RecordService } from '~/services/record.service'

/**
 * @swagger
 * tags:
 *   name: Record
 *   description: API record
 */

export class RecordController {
  /**
   * @swagger
   * /api/record/add:
   *   post:
   *     summary: Thêm mới hồ sơ bệnh án
   *     description: Thêm mới hồ sơ bệnh án
   *     tags:
   *       - Record
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               doctorId:
   *                type: string
   *               diagnosis:
   *                type: string
   *               prescription:
   *                type: string
   *               notes:
   *                type: string
   *               medicalAppointmentId:
   *                type: string
   *     responses:
   *       201:
   *         description: Thêm mới thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */

  static async addRecord(req: Request, res: Response) {
    try {
      const body: CreateRecordType = req.body
      const result: any = await RecordService.createRecord(body, req.user)
      res.json(apiResponse(HttpStatus.CREATED, 'Tạo mới hồ sơ bệnh án thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/record:
   *   get:
   *     summary: Lấy danh sách hồ sơ bệnh án
   *     description: Lấy danh sách hồ sơ bệnh án
   *     tags:
   *       - Record
   *     parameters:
   *       - in: query
   *         name: page
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: sort
   *         required: false
   *         schema:
   *           type: string
   *       - in: query
   *         name: order
   *         required: false
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lấy danh sách thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getAllRecords(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query
      const result: any = await RecordService.getAllRecords(
        Number(page),
        Number(limit),
        String(sort),
        String(order),
        req.user
      )
      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách hồ sơ bệnh án thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/record/{id}:
   *   get:
   *     summary: Lấy chi tiết hồ sơ bệnh án
   *     description: Lấy chi tiết hồ sơ bệnh án
   *     tags:
   *       - Record
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lấy chi tiết thành công
   *       400:
   *         description: Hồ sơ bệnh án không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getRecordById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result: any = await RecordService.getRecordById(id)
      res.json(apiResponse(HttpStatus.OK, 'Lấy chi tiết hồ sơ bệnh án thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }

  }

  /**
   * @swagger
   * /api/record/delete/{id}:
   *   delete:
   *     summary: Xóa hồ sơ bệnh án
   *     description: Xóa hồ sơ bệnh án
   *     tags:
   *       - Record
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Xóa thành công
   *       400:
   *         description: Hồ sơ bệnh án không tồn tại
   *       500:
   *        description: Lỗi máy chủ
   */
  static async deleteRecord(req: Request, res: Response) {
    try {
      const { id } = req.params
      await RecordService.deleteRecord(id, req.user)
      res.json(apiResponse(HttpStatus.OK, 'Xóa hồ sơ bệnh án thành công', null))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/record/update/{id}:
   *   put:
   *     summary: Cập nhật hồ sơ bệnh án
   *     description: Cập nhật hồ sơ bệnh án
   *     tags:
   *       - Record
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               diagnosis:
   *                type: string
   *               prescription:
   *                type: string
   *               notes:
   *                type: string
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   *       400:
   *         description: Hồ sơ bệnh án không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async updateRecord(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body: CreateRecordType = req.body
      const result: any = await RecordService.updateRecord(id, body, req.user)
      res.json(apiResponse(HttpStatus.OK, 'Cập nhật hồ sơ bệnh án thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
