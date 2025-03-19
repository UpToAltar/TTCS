import jwt from 'jsonwebtoken'

export const generateToken = (payload: object, key?: string) => {
  return jwt.sign(payload,key ? key : (process.env.JWT_SECRET || 'secretKey') , { expiresIn: process.env.ACCESS_TOKEN_EXPIRED || '30m' } as jwt.SignOptions)
}
