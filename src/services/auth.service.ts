import { Op, Sequelize } from 'sequelize'
import { User } from '~/models/User'
import { LoginType, RegisterType } from '~/type/auth.type'
import bcrypt from 'bcrypt'
import { Role } from '~/models/Role'
import { v4 as uuidv4 } from 'uuid'
import { generateToken } from '~/utils/token'
import { sendVerificationEmail } from '~/utils/mail'
import jwt from 'jsonwebtoken'

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

      // Gửi email xác nhận
      const verificationToken = generateToken({ id: newUser?.dataValues.id })
      await sendVerificationEmail(user.email, verificationToken)

      return {
        user: {
          id: newUser?.dataValues.id,
          userName: newUser?.dataValues.userName,
          email: newUser?.dataValues.email,
          phone: newUser?.dataValues.phone
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async loginService(body: LoginType) {
    try {
      // Kiểm tra email hoặc số điện thoại đã tồn tại
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: body.emailOrPhone }, { phone: body.emailOrPhone }]
        },
        include: [
          {
            model: Role,
            attributes: ['id', 'name']
          }
        ]
      })

      if (!user) {
        throw new Error('Email hoặc số điện thoại không tồn tại')
      }
      // Kiểm tra mật khẩu
      const checkPassword = await bcrypt.compare(body.password, user?.dataValues.password)
      if (!checkPassword) {
        throw new Error('Mật khẩu không đúng')
      }
      
      const resultUser = {
        id: user?.dataValues.id,
        userName: user?.dataValues.userName,
        email: user?.dataValues.email,
        phone: user?.dataValues.phone,
        role: user?.dataValues.role?.dataValues.name || ''
      }

      // Tạo token
      const token = generateToken(resultUser, process.env.ACCESS_TOKEN_SECRET)

      return { access_token: token, user: resultUser }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Kích hoạt tài khoản khi người dùng xác nhận email
  static async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtSecret') as { id: string }
      const user = await User.findByPk(decoded.id)

      if (!user) {
        throw new Error('Người dùng không tồn tại hoặc đã bị xoá')
      }

      if (user?.dataValues.status) {
        throw new Error('Tài khoản đã được kích hoạt')
      }

      console.log('user', user)

      // Cập nhật trạng thái tài khoản
      await user.update({ status: true })

      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
