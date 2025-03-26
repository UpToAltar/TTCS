export type updateUserBySelfType = {
    userName: string | null
    email: string | null
    phone: string | null
    birthDate: Date | null
    gender: boolean | null
    address: string | null
}
export type updateUserByAdminType = {
    rolename: string
    userName: string | null
    email: string | null
    phone: string | null
    birthDate: Date | null
    gender: boolean | null
    address: string | null
}