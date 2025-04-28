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
}
