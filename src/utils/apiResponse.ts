import { ApiResponse } from './responseTypes'
import { HttpStatus } from './httpStatus'

export const apiResponse = <T>(
  statusCode: HttpStatus,
  message: string,
  data: T | null = null,
  isError: boolean = false
): ApiResponse<T> => {
  return { statusCode, message, data, isError }
}
