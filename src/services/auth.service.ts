import { Op, Sequelize } from "sequelize";
import { User } from "~/models/User";
import { RegisterType } from "~/type/auth.type";
import bcrypt from 'bcrypt'
import { Role } from "~/models/Role";
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  static async registerService(user: RegisterType) {
    try {
      // Kiểm tra email hoặc số điện thoại đã tồn tại
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: user.email }, { phone: user.phone }]
        }
      })

      if (existingUser) {
        throw new Error('Email hoặc số điện thoại đã tồn tại')
      }

      // Băm mật khẩu
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(user.password, salt)

      // Tìm kiếm role "User"
      const userRole = await Role.findOne({ where: { name: 'User' } })
      if (!userRole) {
        throw new Error('Không tìm thấy Role "User"')
      }
      console.log(userRole?.dataValues.id.toString(), ' id')

      // Tạo người dùng mới với id UUID
      const newUser = await User.create({
        id: uuidv4(),
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        roleId: userRole?.dataValues.id.toString(),
        status: false // Mặc định chưa kích hoạt tài khoản
      })

      return {
        user: {
          id: newUser?.dataValues.id,
          userName: newUser?.dataValues.userName,
          email: newUser?.dataValues.email,
          phone: newUser?.dataValues.phone
        }
      }
    } catch (error : any) {
      throw new Error(error.message)
    }
  }
}
