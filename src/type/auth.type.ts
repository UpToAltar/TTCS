
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