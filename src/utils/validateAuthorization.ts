export const validateAuthorization = (user: any, userId: string): boolean => {
  try {
    if (user.role == 'Admin') {
      return true
    }
    if (user.role == 'Doctor') {
      return user.id == userId
    }
    return false
  } catch (error) {
    return false
  }
}
