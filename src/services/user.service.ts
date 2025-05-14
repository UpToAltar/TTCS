import { createNewUserType, updateUserByAdminType, updateUserBySelfType } from '~/type/user.type'
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { Doctor } from '~/models/Doctor'
import moment from 'moment'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { CreatedAt } from 'sequelize-typescript'

export class UserService {
  static async getUsers(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit

      // Điều kiện tìm kiếm theo userName, email, phone
      const whereCondition: any = {}

      if (search) {
        whereCondition[Op.or] = [
          { userName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      }

      // Tìm và đếm số lượng user
      const { rows, count } = await User.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['name', 'id']
          }
        ],
        order: [[sort, order]],
        limit,
        offset
      })

      // Trả về kết quả
      return {
        total: count,
        users: rows.map((user) => ({
          id: user?.dataValues.id,
          userName: user?.dataValues.userName,
          email: user?.dataValues.email,
          phone: user?.dataValues.phone,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
          roleName: user?.dataValues.role?.dataValues.name,
          roleId: user?.dataValues.role?.dataValues.id,
          img: user?.dataValues.img,
          status: user?.dataValues.status,
          birthDate: user?.dataValues.birthDate
            ? moment(user?.dataValues.birthDate).format('DD/MM/YYYY') // Hiển thị lại dd-mm-yyyy
            : null,
          createdAt: moment(user?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(user?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        }))
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async getUserById(id: string) {
    try {
      // Lấy người dùng theo ID
      const user = await User.findByPk(id)
      const role = await Role.findByPk(user?.dataValues.roleId)
      if (!user) return null
      return {
        id: user?.dataValues.id,
        userName: user?.dataValues.userName,
        email: user?.dataValues.email,
        birthDate: moment(user?.dataValues.birthDate).format('DD/MM/YYYY'), // Hiển thị lại dd-mm-yyyy
        gender: user?.dataValues.gender,
        address: user?.dataValues.address,
        roleName: role?.dataValues.name,
        roleId: user?.dataValues.roleId,
        phone: user?.dataValues.phone,
        img: user?.dataValues.img,
        status: user?.dataValues.status,
        createdAt: moment(user?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(user?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async creatUserbyAdmin(body: createNewUserType) {
    try {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: body.email }, { phone: body.phone }]
        }
      })

      if (existingUser) {
        throw new Error('Email hoặc số điện thoại đã tồn tại')
      }
      const role = await Role.findOne({
        where: { name: body.roleName }
      })
      // Băm mật khẩu
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(body.phone, salt) //Mặc định password = phone
      // Format birthDate từ dd/mm/yyyy sang yyyy-mm-dd
      const formattedBirthDate = body.birthDate ? moment(body.birthDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null
      if (!role) {
        throw new Error(`Không tìm thấy vai trò`)
      }
      const user = await User.create({
        id: uuidv4(),
        userName: body.userName,
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        birthDate: formattedBirthDate,
        gender: body.gender,
        address: body.address,
        roleId: role?.dataValues.id,
        img: body.img ? body.img : 'https://i.pinimg.com/474x/7c/c7/a6/7cc7a630624d20f7797cb4c8e93c09c1.jpg',
        status: true // tài khoản đã được kích hoạt
      })
      // Đảm bảo User đã được commit vào database trước khi tạo Doctor
      await user.reload()
      // Nếu user có vai trò là "doctor", tạo thêm bản ghi trong bảng Doctor
      if (body.roleName === 'Doctor') {
        await Doctor.create({
          id: uuidv4(),
          userId: user?.dataValues.id, // Liên kết với user vừa tạo
          specialtyId: null,
          degree: 'Bác sĩ',
          description: 'Bác sĩ chuyên khoa'
        })
      }
      return {
        message: 'Thêm mới người dùng thành công',
        user: {
          phone: user?.dataValues.phone,
          email: user?.dataValues.email,
          userName: user?.dataValues.userName,
          birthDate: user?.dataValues.birthDate
            ? moment(user?.dataValues.birthDate).format('DD/MM/YYYY') // Hiển thị lại dd-mm-yyyy
            : null,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
          roleName: body.roleName,
          roleId: role?.dataValues.id,
          img: user?.dataValues.img,
          status: user?.dataValues.status,
          id: user?.dataValues.id,
          createdAt: moment(user?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(user?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  // Cập nhật thông tin người dùng

  static async updateUserBySelf(userId: string, body: updateUserBySelfType) {
    try {
      const formattedBirthDate = body.birthDate ? moment(body.birthDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null
      // Kiểm tra email hoặc số điện thoại đã tồn tại
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: body.email }, { phone: body.phone }],
          id: { [Op.ne]: userId } // Loại trừ chính người dùng đang cập nhật
        }
      })
      if (existingUser) {
        throw new Error('Email hoặc số điện thoại đã tồn tại')
      }
      const user = await User.findByPk(userId)
      if (user) {
        await user.update({
          userName: body.userName,
          birthDate: formattedBirthDate,
          gender: body.gender,
          address: body.address,
          phone: body.phone,
          email: body.email,
          img: body.img
        })
      }
      return {
        message: 'Cập nhật người dùng thành công',
        user: {
          userName: user?.dataValues.userName,
          birthDate: user?.dataValues.birthDate
            ? moment(user?.dataValues.birthDate).format('DD/MM/YYYY') // Hiển thị lại dd-mm-yyyy
            : null,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
          phone: user?.dataValues.phone,
          email: user?.dataValues.email,
          img: user?.dataValues.img,
          status: user?.dataValues.status,
          id: user?.dataValues.id,
          createdAt: moment(user?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(user?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async updateUserByAdmin(id: string, body: updateUserByAdminType) {
    try {
      // Kiểm tra Số điện thoại đã tồn tại
      const user = await User.findByPk(id)
      if (!user) {
        throw new Error('Người dùng không tồn tại')
      }
      // Kiểm tra xem có người dùng nào khác có cùng số điện thoại hoặc email không
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ phone: body.phone }, { email: body.email }],
          id: { [Op.ne]: user?.dataValues.id } // Loại trừ chính người dùng đang cập nhật
        }
      })
      if (existingUser) {
        throw new Error('Số điện thoại hoặc email đã được sử dụng bởi người dùng khác')
      }
      // Format birthDate từ dd/mm/yyyy sang yyyy-mm-dd
      const formattedBirthDate = body.birthDate ? moment(body.birthDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : null

      if (user) {
        await user.update({
          phone: body.phone,
          email: body.email,
          userName: body.userName,
          birthDate: formattedBirthDate,
          gender: body.gender,
          address: body.address,
          img: body.img,
          status: body.status
        })
      }
      return {
        id: user?.dataValues.id,
        phone: user?.dataValues.phone,
        email: user?.dataValues.email,
        userName: user?.dataValues.userName,
        birthDate: user?.dataValues.birthDate
          ? moment(user?.dataValues.birthDate).format('DD/MM/YYYY') // Hiển thị lại dd-mm-yyyy
          : null,
        gender: user?.dataValues.gender,
        address: user?.dataValues.address,
        img: user?.dataValues.img,
        status: user?.dataValues.status,
        createdAt: moment(user?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(user?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Xóa người dùng
  static async deleteUser(id: string) {
    try {
      const user = await User.findByPk(id)
      if (!user) {
        throw new Error('Người dùng không tồn tại')
      }
      // Kiểm tra xem người dùng có phải là bác sĩ hay không
      const doctor = await Doctor.findOne({ where: { userId: id } })
      // Nếu là bác sĩ thì xóa bác sĩ
      if (doctor) {
        await doctor.destroy()
      }
      // Xóa người dùng
      await user.destroy()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
