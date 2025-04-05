export type updateUserBySelfType = {
  userName: string | null
  email: string | null
  phone: string | null
  birthDate: Date | null
  gender: boolean | null
  address: string | null
}
export type updateUserByAdminType = {

  userName: string | null
  email: string | null
  phone: string | null
  birthDate: Date | null
  gender: boolean | null
  address: string | null
}
export type createNewUserType = {
  rolename: string
  userName: string
  email: string
  phone: string
  birthDate: Date
  gender: boolean
  address: string
}

