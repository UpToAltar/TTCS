export type updateUserBySelfType = {
  userName: string | null
  email: string | null
  phone: string | null
  birthDate: Date | null
  gender: boolean | null
  address: string | null
  img: string | null
}
export type updateUserByAdminType = {

  userName: string | null
  email: string | null
  phone: string | null
  birthDate: Date | null
  gender: boolean | null
  address: string | null
  img: string | null
  status: boolean
}
export type createNewUserType = {
  roleName: string
  userName: string
  email: string
  phone: string
  birthDate: Date
  gender: boolean
  address: string
  img: string | null
}

