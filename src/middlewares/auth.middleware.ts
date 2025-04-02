import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtUserType } from '~/type/auth.type'
import { apiResponse } from '~/utils/apiResponse'
import { HttpStatus } from '~/utils/httpStatus'

export const authentication: any = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Lấy token từ header Authorization

  if (!token) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json(apiResponse(HttpStatus.UNAUTHORIZED, 'Token không hợp lệ vui lòng đăng nhập lại', null, true))
  }

  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET as string
    const decoded: JwtUserType = jwt.verify(token, secretKey) as JwtUserType // Xác thực token

    // Kiểm tra tài khoản đã kích hoạt chưa
    if(!decoded.status) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json(apiResponse(HttpStatus.FORBIDDEN, 'Tài khoản chưa kích hoạt vui lòng kích hoạt qua email', null, true))
    }

    req.user = decoded // Gán thông tin user vào request
    next() // Chuyển sang controller
  } catch (error) {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json(apiResponse(HttpStatus.FORBIDDEN, 'Xác thực token thất bại', null, true))
  }
}

export const isAdmin: any = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Kiểm tra user có trong request không (do middleware xác thực trước đó gán vào)
    if (!req.user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(apiResponse(HttpStatus.UNAUTHORIZED, 'Bạn chưa đăng nhập!', null, true))
    }

    // Kiểm tra role có phải Admin không
    if (req.user.role !== 'Admin') {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json(apiResponse(HttpStatus.FORBIDDEN, 'Chỉ Admin có quyền truy cập!', null, true))
    }

    // Nếu là Admin thì cho phép tiếp tục
    next()
  } catch (error: any) {
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
  }
}

export const isDoctor: any = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Kiểm tra user có trong request không (do middleware xác thực trước đó gán vào)
    if (!req.user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(apiResponse(HttpStatus.UNAUTHORIZED, 'Bạn chưa đăng nhập!', null, true))
    }

    // Kiểm tra role có phải Doctor không
    if (req.user.role !== 'Doctor') {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json(apiResponse(HttpStatus.FORBIDDEN, 'Chỉ bác sĩ có quyền truy cập!', null, true))
    }

    // Nếu là Admin thì cho phép tiếp tục
    next()
  } catch (error: any) {
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
  }
}

export const isAdminOrDoctor: any = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Kiểm tra user có trong request không (do middleware xác thực trước đó gán vào)
    if (!req.user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(apiResponse(HttpStatus.UNAUTHORIZED, 'Bạn chưa đăng nhập!', null, true))
    }

    // Kiểm tra role có phải Admin hoặc Doctor không
    if (req.user.role !== 'Admin' && req.user.role !== 'Doctor') {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json(apiResponse(HttpStatus.FORBIDDEN, 'Chỉ Admin hoặc bác sĩ có quyền truy cập!', null, true))
    }

    // Nếu là Admin hoặc Doctor thì cho phép tiếp tục
    next()
  } catch (error: any) {
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(apiResponse(HttpStatus.INTERNAL_SERVER_ERROR, error.message, null, true))
  }
}
