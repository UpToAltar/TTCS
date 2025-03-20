import { RegisterType } from "~/type/auth.type";
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
export class UserService {
  static async getAllUsers() {
    return [{ id: 1, name: 'John Doe' }]
  }

  // Lấy thông tin người dùng theo ID
  static async getUserById(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'userName', 'email', 'phone', 'status'],
      include: [{ model: Role, attributes: ['name'] }]
    })

    if (!user) {
      throw new Error('Người dùng không tồn tại')
    }

    return user
  }

  // Cập nhật thông tin người dùng (chỉ cập nhật username, email, phone)
  static async updateUser(userId: string, data: { userName?: string; email?: string; phone?: string }) {
    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('Người dùng không tồn tại')
    }

    await user.update(data)
    return user
  }

  // Xóa người dùng (chỉ admin có thể thực hiện)
  static async deleteUser(userId: string, adminId: string) {
    const admin = await User.findByPk(adminId, { include: [Role] })
    if (!admin || admin.role.name !== 'Admin') {
      throw new Error('Bạn không có quyền xóa người dùng')
    }

    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('Người dùng không tồn tại')
    }

    await user.destroy()
    return { message: 'Người dùng đã được xóa thành công' }
  }
}
