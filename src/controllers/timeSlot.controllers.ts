import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { addTimeSlotType } from '~/type/timeSlot.type'
import { TimeSlotService } from '~/services/timeSlot.service'

/**
 * @swagger
 * tags:
 *   name: TimeSlot
 *   description: API thời gian khám
 */

export class TimeSlotController {
  /**
   * @swagger
   * /api/timeSlot/add:
   *   post:
   *     summary: Thêm mới thời gian khám
   *     description: Thêm mới thời gian khám
   *     tags:
   *       - TimeSlot
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               doctorId:
   *                type: string
   *               startDate:
   *                type: string
   *               endDate:
   *                type: string
   *               status:
   *                type: boolean
   *     responses:
   *       201:
   *         description: Thêm mới thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */

  static async addTimeSlot(req: Request, res: Response) {
    try {
      const body: addTimeSlotType = req.body
      const result: any = await TimeSlotService.addTimeSlot(body, req.user)
      res.json(apiResponse(HttpStatus.CREATED, 'Tạo mới thời gian khám thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  // Lấy danh sách thời gian khám theo bác sĩ và ngày
  /**
   * @swagger
   * /api/timeSlot:
   *   get:
   *     summary: Lấy danh sách thời gian khám
   *     description: Lấy danh sách thời gian khám theo bác sĩ và ngày
   *     tags:
   *       - TimeSlot
   *     parameters:
   *       - in: query
   *         name: doctorId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lấy danh sách thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   */
  static async getTimeSlotByDoctorAndDay(req: Request, res: Response) {
    try {
      const { doctorId, date } = req.query
      if (!doctorId || !date) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Thiếu thông tin bác sĩ hoặc ngày', null, true))
      } else {
        const result: any = await TimeSlotService.getAllTimeSlotOfDoctorByDay(
          doctorId.toString(),
          date.toString(),
          req.user
        )
        res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách thời gian khám thành công', result))
      }
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/timeSlot/delete/{id}:
   *   delete:
   *     summary: Xóa thời gian khám
   *     description: Xóa thời gian khám theo ID
   *     tags:
   *       - TimeSlot
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Xóa thành công
   *       404:
   *         description: Không tìm thấy thời gian khám
   */
  static async deleteTimeSlot(req: Request, res: Response) {
    try {
      const { id } = req.params
      await TimeSlotService.deleteTimeSlot(id.toString(), req.user)
      res.json(apiResponse(HttpStatus.OK, 'Xóa thời gian khám thành công', null))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/timeSlot/update/{id}:
   *   put:
   *     summary: Cập nhật thời gian khám
   *     description: Cập nhật thời gian khám theo ID
   *     tags:
   *       - TimeSlot
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
   *               doctorId:
   *                type: string
   *               startDate:
   *                type: string
   *               endDate:
   *                type: string
   *               status:
   *                type: boolean
   *     responses:
   *      200:
   *        description: Cập nhật thành công
   *      404:
   *       description: Không tìm thấy thời gian khám
   *      500:
   *       description: Lỗi máy chủ
   *
   */
  static async updateTimeSlot(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body: addTimeSlotType = req.body
      const result: any = await TimeSlotService.updateTimeSlot(id.toString(), body, req.user)
      res.json(apiResponse(HttpStatus.OK, 'Cập nhật thời gian khám thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/timeSlot/{id}:
   *   get:
   *     summary: Lấy thông tin thời gian khám
   *     description: Lấy thông tin thời gian khám theo ID
   *     tags:
   *       - TimeSlot
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lấy thông tin thành công
   *       404:
   *         description: Không tìm thấy thời gian khám
   */
  static async getTimeSlotById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result: any = await TimeSlotService.getTimeSlotById(id.toString())
      if (!result) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Thời gian khám không tồn tại', null, true))
      } else {
        res.json(apiResponse(HttpStatus.OK, 'Lấy thông tin thời gian khám thành công', result))
      }
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  //Tạo lịch khám mặc địng cho ngày hôm nay theo doctorId
  /**
   * @swagger
   * /api/timeSlot/createDefaultTimeSlot:
   *   post:
   *     summary: Tạo lịch khám mặc định
   *     description: Tạo lịch khám mặc định cho ngày hôm nay theo doctorId
   *     tags:
   *       - TimeSlot
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               doctorId:
   *                type: string
   *     responses:
   *       201:
   *         description: Tạo lịch khám thành công
   *       500:
   *         description: Dữ liệu không hợp lệ
   */
  static async createDefaultTimeSlot(req: Request, res: Response) {
    try {
      const { doctorId } = req.body
      const result: any = await TimeSlotService.addDefaultTimeSlot(doctorId.toString(), req.user)
      res.json(apiResponse(HttpStatus.CREATED, 'Tạo lịch khám mặc định thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/timeSlot/schedule/{doctorId}:
   *   get:
   *     summary: Lấy danh sách ngày có lịch khám của bác sĩ
   *     description: Lấy danh sách các ngày có lịch khám của bác sĩ trong tương lai
   *     tags:
   *       - TimeSlot
   *     parameters:
   *       - in: path
   *         name: doctorId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lấy danh sách thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       date:
   *                         type: string
   *                         example: "12/05/2024"
   *                       total:
   *                         type: number
   *                         example: 3
   *                       title:
   *                         type: string
   *                         example: "Th 2, 12-05"
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getDoctorScheduleDates(req: Request, res: Response) {
    try {
      const { doctorId } = req.params
      if (!doctorId) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Thiếu thông tin bác sĩ', null, true))
      } else {
        const result = await TimeSlotService.getDoctorScheduleDates(doctorId.toString())
        res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách ngày có lịch khám thành công', result))
      }
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
