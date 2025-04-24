import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { CreateInvoiceType } from '~/type/invoice.type'
import { InvoiceService } from '~/services/invoice.service'

/**
 * @swagger
 * tags:
 *   name: Invoice
 *   description: API invoice
 */

export class InvoiceController {
  /**
   * @swagger
   * /api/invoice/add:
   *   post:
   *     summary: Thêm mới hóa đơn
   *     description: Thêm mới hóa đơn
   *     tags:
   *       - Invoice
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               appointmentId:
   *                 type: string
   *               total:
   *                 type: number
   *               status:
   *                 type: string
   *               note:
   *                 type: string
   *     responses:
   *       201:
   *         description: Thêm mới thành công
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       500:
   *         description: Lỗi máy chủ
   */

  static async addInvoice(req: Request, res: Response) {
    try {
      const body: CreateInvoiceType = req.body
      const result: any = await InvoiceService.addInvoice(body)
      res.json(apiResponse(HttpStatus.CREATED, 'Tạo mới hóa đơn thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/invoice:
   *   get:
   *     summary: Lấy danh sách hóa đơn
   *     description: API để lấy danh sách hóa đơn với phân trang, tìm kiếm, và sắp xếp
   *     tags:
   *       - Invoice
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
   *         description: Số lượng hóa đơn trên mỗi trang
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
   *         description: Danh sách hóa đơn trả về thành công
   *       500:
   *         description: Lỗi máy chủ
   */
  static async getAllInvoices(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'DESC' } = req.query
      const result = await InvoiceService.getAllInvoices(
        Number(page),
        Number(limit),
        String(search),
        String(sort),
        String(order)
      )
      res.json(apiResponse(HttpStatus.OK, 'Lấy danh sách hóa đơn thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/invoice/{id}:
   *   get:
   *     summary: Lấy thông tin hóa đơn theo ID
   *     description: API để lấy thông tin hóa đơn theo ID
   *     tags:
   *       - Invoice
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID của hóa đơn
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lấy thông tin hóa đơn thành công
   *       404:
   *         description: Hóa đơn không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */

  static async getInvoiceById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await InvoiceService.getInvoiceById(id)
      res.json(apiResponse(HttpStatus.OK, 'Lấy thông tin hóa đơn thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }

  /**
   * @swagger
   * /api/invoice/{id}:
   *   delete:
   *     summary: Xóa hóa đơn theo ID
   *     description: API để xóa hóa đơn theo ID
   *     tags:
   *       - Invoice
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID của hóa đơn
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Xóa hóa đơn thành công
   *       404:
   *         description: Hóa đơn không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */

  static async deleteInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params
      await InvoiceService.deleteInvoice(id)
      res.json(apiResponse(HttpStatus.OK, 'Xóa hóa đơn thành công'))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }


  /**
   * @swagger
   * /api/invoice/update/{id}:
   *   put:
   *     summary: Cập nhật hóa đơn theo ID
   *     description: API để cập nhật hóa đơn theo ID
   *     tags:
   *       - Invoice
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID của hóa đơn
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               total:
   *                 type: number
   *               status:
   *                 type: string
   *               note:
   *                 type: string
   *     responses:
   *       200:
   *         description: Cập nhật hóa đơn thành công
   *       404:
   *         description: Hóa đơn không tồn tại
   *       500:
   *         description: Lỗi máy chủ
   */

  static async updateInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body: CreateInvoiceType = req.body
      const result = await InvoiceService.updateInvoice(id, body)
      res.json(apiResponse(HttpStatus.OK, 'Cập nhật hóa đơn thành công', result))
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
    }
  }
}
