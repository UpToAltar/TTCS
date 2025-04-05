import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { NotificationService } from '~/services/notification.service'

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API notification
 */
export class NotificationController {
  /**
   * @swagger
   * /api/notification/add:
   *   post:
   *     summary: Thêm mới thông báo
   *     description: Thêm mới thông báo
   *     tags:
   *       - Notification
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               userId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Thêm mới thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async addNotification(req: Request, res: Response) {
    try {
      const notification = req.body
      const result = await NotificationService.addNotification(notification)
      res.json(apiResponse(HttpStatus.CREATED, 'Tạo mới thông báo thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
  /**
   * @swagger
   * /api/notification:
   *   get:
   *     summary: Lấy danh sách thông báo
   *     description: API để lấy danh sách thông báo với phân trang, tìm kiếm, và sắp xếp
   *     tags:
   *       - Notification
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
   *         description: Số lượng thông báo trên mỗi trang
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Từ khóa tìm kiếm
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
   *         description: Danh sách thông báo trả về thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getAllNotifications(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'DESC' } = req.query
      const result = await NotificationService.getAllNotifications(
        Number(page),
        Number(limit),
        String(search),
        String(sort),
        String(order)
      )
      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách thông báo thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
  /**
   * @swagger
   * /api/notification/{id}:
   *   get:
   *     summary: Lấy chi tiết thông báo
   *     description: API để lấy thông tin chi tiết của một thông báo
   *     tags:
   *       - Notification
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của thông báo
   *     responses:
   *       200:
   *         description: Trả về thông tin thông báo thành công
   *       404:
   *         description: Thông báo không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getNotificationById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await NotificationService.getNotificationById(id)
      if (!result) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Thông báo không tồn tại', null, true))
      } else {
        res.json(apiResponse(HttpStatus.OK, 'Lấy thông tin thông báo thành công', result))
      }
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/notification/delete/{id}:
   *   delete:
   *     summary: Xóa thông báo
   *     description: Xóa một thông báo theo ID
   *     tags:
   *       - Notification
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
   *         description: Không tìm thấy thông báo
   *       500:
   *         description: Lỗi máy chủ
   */
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params
      await NotificationService.deleteNotification(id)
      res.json(apiResponse(HttpStatus.OK, 'Xóa thông báo thành công', null))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}