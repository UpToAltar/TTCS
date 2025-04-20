import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { RecordService } from '~/services/record.service'
import { AppointmentService } from '~/services/appointment.service'
import { createAppointmentType, UpdateAppointmentType } from '~/type/appointment.type'

/**
 * @swagger
 * tags:
 *   name: Appointment
 *   description: API appointment
 */

export class AppointmentController {
  /**
   * @swagger
   * /api/appointment/add:
   *   post:
   *     summary: Thêm mới lịch hẹn khám bệnh
   *     description: Thêm mới lịch hẹn khám bệnh
   *     tags:
   *       - Appointment
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               bookingId:
   *                type: string
   *     responses:
   *       201:
   *         description: Thêm mới thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */

  static async addAppointment(req: Request, res: Response) {
    try {
      const body: createAppointmentType = req.body
      const result: any = await AppointmentService.addAppointment(body, req.user)
      res.json(apiResponse(HttpStatus.CREATED, 'Tạo mới lịch hẹn khám bệnh thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/appointment:
   *   get:
   *     summary: Lấy danh sách lịch hẹn lịch hẹn khám bệnh
   *     description: Lấy danh sách lịch hẹn khám bệnh
   *     tags:
   *       - Appointment
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
  static async getAllAppointment(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query
      const result: any = await AppointmentService.getAllAppointments(
        Number(page),
        Number(limit),
        String(sort),
        String(order),
        req.user
      )
      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách lịch hẹn khám thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/appointment/{id}:
   *   get:
   *     summary: Lấy chi tiết lịch hẹn khám bệnh
   *     description: Lấy chi tiết lịch hẹn khám bệnh
   *     tags:
   *       - Appointment
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
   *         description: Lịch hẹn không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getAppointmentById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result: any = await AppointmentService.getAppointmentById(id)
      res.json(apiResponse(HttpStatus.OK, 'Lấy chi tiết lịch hẹn khám bệnh thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }

  }

  /**
   * @swagger
   * /api/appointment/delete/{id}:
   *   delete:
   *     summary: Xóa lịch hẹn
   *     description: Xóa lịch hẹn
   *     tags:
   *       - Appointment
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
   *         description: Lịch hẹn không tồn tại
   *       500:
   *        description: Lỗi máy chủ
   */
  static async deleteAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params
      await AppointmentService.deleteAppointment(id, req.user)
      res.json(apiResponse(HttpStatus.OK, 'Xóa lịch hẹn thành công', null))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/appointment/update/{id}:
   *   put:
   *     summary: Cập nhật hồ sơ bệnh án
   *     description: Cập nhật hồ sơ bệnh án
   *     tags:
   *       - Appointment
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
   *               status:
   *                type: string
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   *       400:
   *         description: Lịch hẹn không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async updateAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body: UpdateAppointmentType = req.body
      const result: any = await AppointmentService.updateAppointment(id, body, req.user)
      res.json(apiResponse(HttpStatus.OK, 'Cập nhật lịch hẹn thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
