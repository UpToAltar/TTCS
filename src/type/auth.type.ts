
export type RegisterType = {
  email: string
  password: string
  userName: string
  phone: string
  confirmPassword: string
}

export type LoginType = {
  emailOrPhone: string
  password: string
}

export type JwtUserType = {
  id: string | null
  userName: string | null
  email: string | null
  phone: string | null
  role: string | null
  status: boolean
  iat?: any 
  exp?: any
}

export type ChangePasswordType = {
  email: string
  code: string
  password: string
  confirmPassword: string
}