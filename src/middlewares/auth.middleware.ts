import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'

export const authentication : any = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Lấy token từ header Authorization

  if (!token) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json(apiResponse(HttpStatus.UNAUTHORIZED, 'Token không hợp lệ vui lòng đăng nhập lại', null, true))
  }

  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET as string
    const decoded = jwt.verify(token, secretKey) // Xác thực token

    req.user = decoded // Gán thông tin user vào request
    next() // Chuyển sang controller
  } catch (error) {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json(apiResponse(HttpStatus.FORBIDDEN, 'Xác thực token thất bại', null, true))
  }
}
