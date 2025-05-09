import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { StatisticService } from '~/services/statistic.service'

/**
 * @swagger
 * tags:
 *   name: Statistic
 *   description: API thống kê
 */

export class StatisticController {

  /**
   * @swagger
   * /api/statistic/dashboard:
   *   get:
   *     summary: Thống kê tổng quan
   *     description: Thống kê tổng quan
   *     tags:
   *       - Statistic
   *     responses:
   *       200:
   *         description: Thống kê thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getTotal(req: Request, res: Response) {
    try {
      const result = await StatisticService.getStatisticDashBoard()
      res.json(apiResponse(HttpStatus.OK, 'Thống kê thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/statistic/user:
   *   get:
   *     summary: Thống kê người dùng
   *     description: Thống kê người dùng
   *     tags:
   *       - Statistic
   *     responses:
   *       200:
   *         description: Thống kê thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getStatisticUser(req: Request, res: Response) {
    try {
      const result = await StatisticService.getStatisticUser()
      res.json(apiResponse(HttpStatus.OK, 'Thống kê thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/statistic/doctor:
   *   get:
   *     summary: Thống kê bác sĩ
   *     description: Thống kê bác sĩ
   *     tags:
   *       - Statistic
   *     responses:
   *       200:
   *         description: Thống kê thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getStatisticDoctor(req: Request, res: Response) {
    try {
      const result = await StatisticService.getStatisticDoctor()
      res.json(apiResponse(HttpStatus.OK, 'Thống kê thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/statistic/timeslot:
   *   get:
   *     summary: Thống kê lịch khám
   *     description: Thống kê lịch khám
   *     tags:
   *       - Statistic
   *     responses:
   *       200:
   *         description: Thống kê thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getStatisticTimeSlot(req: Request, res: Response) {
    try {
      const result = await StatisticService.getStatisticTimeSlot()
      res.json(apiResponse(HttpStatus.OK, 'Thống kê thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/statistic/overview:
   *   post:
   *     tags:
   *       - Statistic
   *     summary: Thống kê tổng quan2
   *     description: Lấy thống kê tổng quan về người dùng, lịch khám, bài viết và liên hệ
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               time:
   *                 type: string
   *                 description: Chọn thời gian thống kê
   *                 enum: [today, this_week, this_month, this_year]
   *                 example: today || this_week || this_month || this_year
   *     responses:
   *       200:
   *         description: Thống kê thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getOverviewStats(req: Request, res: Response) {
    try {
      const { time } = req.body
      const result = await StatisticService.getOverviewStats(time)
      res.json(apiResponse(HttpStatus.OK, 'Thống kê thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/statistic/recent-activities:
   *   get:
   *     summary: Hoạt động gần đây
   *     description: Lấy danh sách các hoạt động gần đây
   *     tags:
   *       - Statistic
   *     responses:
   *       200:
   *         description: Thống kê thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getRecentActivities(req: Request, res: Response) {
    try {
      const result = await StatisticService.getRecentActivities()
      res.json(apiResponse(HttpStatus.OK, 'Thống kê thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
