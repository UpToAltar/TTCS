import { Request, Response } from 'express'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { AddServiceType } from '~/type/service.type'
import { DoctorService } from '~/services/doctor.service'

export class DoctorController {
    /**
     * @swagger
     * /api/doctors:
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

            const result = await DoctorService.getDoctor(
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
}