import { Op, Sequelize } from 'sequelize'
import { User } from '~/models/User'
import { ChangePasswordType, JwtUserType, LoginType, RegisterType } from '~/type/auth.type'
import bcrypt from 'bcrypt'
import { Role } from '~/models/Role'
import { v4 as uuidv4 } from 'uuid'
import { generateToken } from '~/utils/token'
import { sendVerificationEmail } from '~/utils/mail'
import jwt from 'jsonwebtoken'
import moment from 'moment'

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
        status: false, // Mặc định chưa kích hoạt tài khoản,
        img: 'https://i.pinimg.com/474x/7c/c7/a6/7cc7a630624d20f7797cb4c8e93c09c1.jpg'
      })

      // Gửi email xác nhận
      const verificationToken = generateToken({ id: newUser?.dataValues.id })
      await sendVerificationEmail(user.email, verificationToken)

      return {
        user: {
          id: newUser?.dataValues.id,
          userName: newUser?.dataValues.userName,
          email: newUser?.dataValues.email,
          phone: newUser?.dataValues.phone,
          createdAt: moment(newUser?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(newUser?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
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
      if (!user?.dataValues.status) {
        throw new Error('Tài khoản chưa được kích hoạt')
      }

      const resultUser: JwtUserType = {
        id: user?.dataValues.id,
        userName: user?.dataValues.userName,
        email: user?.dataValues.email,
        phone: user?.dataValues.phone,
        role: user?.dataValues.role?.dataValues.name || '',
        status: user?.dataValues.status,
        img: user?.dataValues.img,
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

      // Cập nhật trạng thái tài khoản
      await user.update({ status: true })

      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Gửi OTP qua email để reset mật khẩu
  static async sendEmailResetPassword(email: string) {
    try {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        throw new Error('Email không tồn tại')
      }
      if (user?.dataValues.resetPasswordExpires && user?.dataValues.resetPasswordExpires >= new Date()) {
        throw new Error('Đã gửi OTP và mã OTP còn thời hạn, vui lòng kiểm tra email')
      }

      // Tạo mã OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      // Thời gian hết hạn của OTP
      const minutes = parseInt(process.env.PASSWORD_RESET_EXPIRED || '15m')
      const expires = new Date(Date.now() + minutes * 60 * 1000)

      // Cập nhật mã OTP và thời gian hết hạn
      await user.update({ resetPasswordOTP: otp, resetPasswordExpires: expires })

      // Gửi email
      await sendVerificationEmail(
        email,
        otp,
        'Mã OTP đổi mật khẩu',
        `<p>Vui lòng nhập mã OTP sau để đổi mật khẩu và không cung cấp cho bất kì ai:</p> <h2>${otp}</h2>`
      )

      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Đổi mật khẩu
  static async changePasswordService(body: ChangePasswordType) {
    try {
      const user = await User.findOne({ where: { email: body.email } })
      if (!user) {
        throw new Error('Email không tồn tại')
      }

      // Kiểm tra mã OTP
      if (user?.dataValues.resetPasswordOTP !== body.code) {
        throw new Error('Mã OTP không đúng')
      }
      // Kiểm tra thời gian hết hạn của OTP
      if (user?.dataValues.resetPasswordExpires < new Date()) {
        throw new Error('Mã OTP đã hết hạn')
      }

      // Băm mật khẩu mới
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(body.password, salt)

      // Cập nhật mật khẩu mới
      await user.update({ password: hashedPassword, resetPasswordOTP: null, resetPasswordExpires: null })

      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
