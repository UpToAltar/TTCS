import { Request, RequestHandler, Response } from 'express'
import { BookingService } from '../services/booking.service'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { createBookingType } from '~/type/booking.type'
import { NotificationService } from '~/services/notification.service'
import { validateEmail } from '~/utils/mail'

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: API đặt lịch hẹn
 */
export class BookingController {
  /**
   * @swagger
   * /api/booking/add:
   *   post:
   *     summary: Thêm mới lịch hẹn
   *     description: Thêm mới lịch hẹn
   *     tags:
   *       - Booking
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               timeSlotId:
   *                type: string
   *               serviceId:
   *                type: string
   *     responses:
   *       201:
   *         description: Thêm mới thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */
  static async addBooking(req: Request, res: Response) {
    try {
      const patientId = req.user?.id;
      const body: createBookingType = req.body
      const result: any = await BookingService.createBooking(body, patientId)
      res.json(apiResponse(HttpStatus.CREATED, 'Tạo mới lịch hẹn thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
  /**
   * @swagger
   * /api/booking/verify-email:
   *   get:
   *     summary: Xác nhận đặt lịch qua email
   *     description: Người dùng xác nhận lịch hẹn bằng liên kết email.
   *     tags:
   *       - Booking
   *     parameters:
   *       - in: query
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Mã xác thực đặt lịch gửi qua email
   *     responses:
   *       200:
   *         description: Xác nhận lịch hẹn thành công
   *       400:
   *         description: Token không hợp lệ hoặc lịch đã xác nhận
   *       500:
   *         description: Lỗi máy chủ
   */
  static async verifyBooking(req: Request, res: Response) {
    try {
      const { token } = req.query

      if (!token) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Token không hợp lệ', null, true))
      }
      else {
        const result = await BookingService.verifyBookingEmail(token as string)
        res.json(apiResponse(HttpStatus.OK, 'Xác nhận lịch hẹn thành công', result))
      }
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
  /**
   * @swagger
   * /api/booking/cancel/{id}:
   *   post:
   *     summary: Yêu cầu huỷ lịch hẹn
   *     description: Yêu cầu xác nhận huỷ lịch hẹn
   *     tags:
   *       - Booking
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID của lịch hẹn
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Huỷ thành công
   *       404:
   *         description: Không tìm thấy lịch hẹn hoặc không có quyền huỷ
   *       500:
   *         description: Lỗi máy chủ
   */
  static async requestCancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params
      const patientId = req.user?.id
      const result = await BookingService.cancelBooking(id, patientId)

      res.json(apiResponse(HttpStatus.OK, result.message, null))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/booking/verify-cancel-email:
   *   get:
   *     summary: Hủy lịch hẹn qua email
   *     description: Người dùng hủy lịch hẹn thông qua liên kết email.
   *     tags:
   *       - Booking
   *     parameters:
   *       - in: query
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Mã xác thực hủy lịch gửi qua email
   *     responses:
   *       200:
   *         description: Hủy lịch thành công
   *       400:
   *         description: Token không hợp lệ hoặc không thể hủy
   *       500:
   *         description: Lỗi máy chủ
   */
  static async verifyCancelBooking(req: Request, res: Response) {
    try {
      const { token } = req.query

      if (!token) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Token không hợp lệ', null, true))
      }
      else {
        const result = await BookingService.verifyCancelBEmail(token as string)
        res.json(apiResponse(HttpStatus.OK, 'Hủy lịch hẹn thành công', result))
      }

    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
  /**
   * @swagger
   * /api/booking:
   *   get:
   *     summary: Lấy danh sách lịch hẹn
   *     description: Lấy danh sách lịch hẹn đã xác nhận (status = true). Nếu là bệnh nhân chỉ xem được lịch của chính họ.
   *     tags:
   *       - Booking
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
   *           default: DESC
   *     responses:
   *       200:
   *         description: Lấy danh sách thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getAllBookings(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query

      const result = await BookingService.getAllBooking(
        Number(page),
        Number(limit),
        String(sort),
        String(order),
        req.user
      )

      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách lịch hẹn thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/booking/{id}:
   *   get:
   *     summary: Lấy chi tiết lịch hẹn
   *     description: Lấy chi tiết lịch hẹn theo ID (chỉ lịch đã xác nhận).
   *     tags:
   *       - Booking
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
  static async getBookingById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const result = await BookingService.getBookingById(id)

      res.json(apiResponse(HttpStatus.OK, 'Lấy chi tiết lịch hẹn thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/booking/admin/add:
   *   post:
   *     summary: Thêm mới lịch hẹn (Admin)
   *     description: Thêm mới lịch hẹn cho bệnh nhân (chỉ dành cho Admin)
   *     tags:
   *       - Booking
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               timeSlotId:
   *                type: string
   *               serviceId:
   *                type: string
   *               patientId:
   *                type: string
   *     responses:
   *       201:
   *         description: Thêm mới thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       403:
   *         description: Không có quyền thực hiện
   *       500:
   *         description: Lỗi máy chủ
   */
  static async addBookingByAdmin(req: Request, res: Response) {
    try {
      const body: createBookingType & { patientId: string } = req.body

      if (!body.patientId) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Vui lòng cung cấp ID bệnh nhân', null, true))
      } else {
        const result: any = await BookingService.createBookingByAdmin(body, body.patientId)
        res.json(apiResponse(HttpStatus.CREATED, 'Tạo mới lịch hẹn thành công', result))
      }
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/booking/update-status:
   *   put:
   *     summary: Cập nhật trạng thái lịch hẹn
   *     description: Cập nhật trạng thái lịch hẹn (true/false)
   *     tags:
   *       - Booking
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               bookingId:
   *                type: string
   *               status:
   *                type: boolean
   *     responses:
   *       200:
   *         description: Cập nhật trạng thái thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       404:
   *         description: Không tìm thấy lịch hẹn
   *       500:
   *         description: Lỗi máy chủ
   */
  static async updateBookingStatus(req: Request, res: Response) {
    try {
      const { bookingId, status } = req.body

      if (!bookingId || status === undefined) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Vui lòng cung cấp bookingId và status', null, true))
      } else {
        const result = await BookingService.updateStatusBooking(bookingId, status)
        res.json(apiResponse(HttpStatus.OK, 'Cập nhật trạng thái lịch hẹn thành công', result))
      }

    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}