import { Request } from 'express'

declare module 'express' {
  export interface Request {
    user?: any // Có thể thay `any` bằng kiểu dữ liệu cụ thể nếu có
  }
}
