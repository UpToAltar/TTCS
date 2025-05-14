import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { SpecialtyService } from '~/services/specialty.service'
import { AddNewsType } from '~/type/news.type'
import { NewsService } from '~/services/news.service'

/**
 * @swagger
 * tags:
 *   name: News
 *   description: API bài đăng
 */

export class NewsController {
  /**
   * @swagger
   * /api/news/add:
   *   post:
   *     summary: Thêm mới bài viết
   *     description: API để thêm một bài viết
   *     tags:
   *       - News
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                type: string
   *               type:
   *                type: string
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Thêm mới bài viết thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */
  static async createNews(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json(apiResponse(HttpStatus.BAD_REQUEST, 'Ảnh bài viết là bắt buộc', null, true))
        return
      }

      const body: AddNewsType = req.body
      if (!body.name || !body.description || !body.type) {
        res.status(400).json(apiResponse(HttpStatus.BAD_REQUEST, 'Các trường đều không được để trống', null, true))
        return
      }
      const user = req.user
      body.userId = user.id
      // Tao moi
      const news = await NewsService.createNews(body, req.file)
      res.json(apiResponse(HttpStatus.CREATED, 'Tạo mới bài viết thành công', news))
    } catch (error: any) {
      console.error('Error in createSpecialty:', error)
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/news:
   *   get:
   *     summary: Lấy danh sách bài viết
   *     description: API để lấy danh sách bài viết với phân trang, tìm kiếm, và sắp xếp
   *     tags:
   *       - News
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
   *         description: Số lượng dịch vụ trên mỗi trang
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
   *         description: Danh sách bài viết trả về thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getAllNews(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'DESC' } = req.query
      const result = await NewsService.getAllNews(
        Number(page),
        Number(limit),
        String(search),
        String(sort),
        String(order)
      )
      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách bài viết thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/news/{id}:
   *   get:
   *     summary: Lấy chi tiết bài viết
   *     description: API lấy thông tin chi tiết của một bài viết
   *     tags:
   *       - News
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Trả về thông tin bài viết thành công
   *       404:
   *         description: bài viết không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getNewsById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await NewsService.getNewsById(id)
      if (!result) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(apiResponse(HttpStatus.BAD_REQUEST, 'Bài viết không tồn tại', null, true))
      } else {
        res.json(apiResponse(HttpStatus.OK, 'Lấy thông tin bài viết thành công', result))
      }
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/news/update/{id}:
   *   put:
   *     summary: Cập nhật bài viết
   *     description: API để cập nhật thông tin bài viết
   *     tags:
   *       - News
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               type:
   *                 type: string
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Cập nhật thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */
  static async updateNews(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body: AddNewsType = req.body
      const file = req.file
      const user = req.user
      if (!body.name || !body.description || !body.type) {
        res.status(400).json(apiResponse(HttpStatus.BAD_REQUEST, 'Các trường đều không được để trống', null, true))
        return
      }

      const result = await NewsService.updateNews(id, body, user, file)
      res.json(apiResponse(HttpStatus.OK, 'Cập nhật bài viết thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/news/delete/{id}:
   *   delete:
   *     summary: Xóa bài viết
   *     description: API để xóa bài viết theo ID
   *     tags:
   *       - News
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Xóa bài viết thành công
   *       404:
   *         description: Bài viết không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */
  static async deleteNews(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = req.user
      await NewsService.deleteNews(id, user)
      res.json(apiResponse(HttpStatus.OK, 'Xóa bài viết thành công', null))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
