import { EditDoctorType } from '~/type/doctor.type'
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { Doctor } from '~/models/Doctor'
import { Specialty } from '~/models/Specialty'

export class DoctorService {
  static async getAllDoctor(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit

      // Điều kiện tìm kiếm theo userName, email, phone
      const userWhereCondition: any = {
        status: true // Chỉ lấy người dùng có status = true
      }

      if (search) {
        userWhereCondition[Op.or] = [
          { userName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      }

      // Tìm và đếm số lượng doctor
      const { rows, count } = await User.findAndCountAll({
        where: userWhereCondition,
        include: [
          {
            model: Role,
            as: 'role',
            where: { name: 'Doctor' }, // Lọc chỉ lấy role = "User"
            attributes: ['name']
          }
        ],

        order: [[sort, order]],
        limit,
        offset
      })

      // Trả về kết quả
      return {
        total: count,
        doctors: rows.map((user) => ({
          id: user?.dataValues.id,
          userName: user?.dataValues.userName,
          email: user?.dataValues.email,
          phone: user?.dataValues.phone,
          gender: user?.dataValues.gender,
          address: user?.dataValues.address,
          roleName: user?.role?.dataValues.name
        }))
      }
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi khi lấy danh sách bác sĩ')
    }
  }

  static async getDoctorById(id: string) {
    try {
      const doctor = await Doctor.findOne({
        where: { userId: id }
      })
      if (!doctor) return null

      return {
        id: doctor?.dataValues.userId,
        degree: doctor?.dataValues.degree,
        description: doctor?.dataValues.description
      }
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi khi lấy thông tin bác sĩ')
    }
  }
  static async updateDoctorbyAdmin(id: string, body: EditDoctorType) {
    try {
      const doctor = await Doctor.findOne({
        where: { userId: id }
      })

      if (!doctor) throw new Error('Bác sĩ không tồn tại')
      const specialty = await Specialty.findOne({
        where: { name: body.namespecial }
      })
      if (!specialty) throw new Error('Chuyên khoa không tồn tại')
      if (doctor) {
        await doctor.update({
          degree: body.degree,
          description: body.description,
          specialtyId: specialty?.dataValues.id
        })
      }
      return {
        message: 'Cập nhật thành công',
        doctor: {
          degree: doctor?.dataValues.degree,
          description: doctor?.dataValues.description,
          namespecial: body.namespecial
        }
      }
    } catch (error) {
      throw new Error('Lỗi khi cập nhật người dùng')
    }
  }

  static async updateDoctorBySelf(id: string, body: EditDoctorType) {
    try {
      const doctor = await Doctor.findOne({
        where: { userId: id }
      })
      console.log(doctor)
      const specialty = await Specialty.findOne({
        where: { name: body.namespecial }
      })
      if (doctor) {
        await doctor.update({
          degree: body.degree,
          description: body.description,
          specialtyId: specialty?.dataValues.id
        })
      }
      return {
        message: 'Cập nhật thành công',
        doctor: {
          degree: doctor?.dataValues.degree,
          description: doctor?.dataValues.description,
          namespecial: body.namespecial
        }
      }
    } catch (error) {
      throw new Error('Lỗi khi cập nhật người dùng')
    }
  }
  // Xóa bác sĩ
  static async deleteDoctor(id: string) {
    const user = await User.findByPk(id)
    if (!user) {
      throw new Error('Người dùng không tồn tại')
    }
    // Kiểm tra xem người dùng có phải là bác sĩ hay không
    const doctor = await Doctor.findOne({ where: { userId: id } })
    console.log(doctor)
    if (doctor) {
      await doctor.destroy() // Xóa bản ghi bác sĩ trước
    }
    await user.destroy()
  }
}
