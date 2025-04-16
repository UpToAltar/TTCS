import { EditDoctorType } from '~/type/doctor.type'
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { Doctor } from '~/models/Doctor'
import { Specialty } from '~/models/Specialty'
import e from 'express'

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
        doctors: await Promise.all(
          rows.map(async (user) => {
            const doctor = await Doctor.findOne({
              where: { userId: user?.dataValues.id },
              include: [
                {
                  model: Specialty,
                  as: 'specialty',
                  attributes: ['name', 'id']
                }
              ]
            })

            return {
              id: doctor?.dataValues.id,
              userId: user?.dataValues.id,
              userName: user?.dataValues.userName,
              email: user?.dataValues.email,
              phone: user?.dataValues.phone,
              gender: user?.dataValues.gender,
              address: user?.dataValues.address,
              roleName: user?.role?.dataValues.name,
              img: user?.dataValues.img,
              degree: doctor?.dataValues.degree,
              description: doctor?.dataValues.description,
              specialtyId: doctor?.dataValues.specialty?.dataValues.id,
              specialtyName: doctor?.dataValues.specialty?.dataValues.name
            }
          })
        )
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getDoctorById(id: string) {
    try {
      const doctor = await Doctor.findOne({
        where: { userId: id },
        include: [
          {
            model: Specialty,
            as: 'specialty',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'userName', 'email', 'phone', 'address', 'img']
          }
        ]
      })
      if (!doctor) return null

      return {
        id: doctor?.dataValues.id,
        userId: doctor?.dataValues.user?.dataValues.id,
        userName: doctor?.dataValues.user?.dataValues.userName,
        email: doctor?.dataValues.user?.dataValues.email,
        phone: doctor?.dataValues.user?.dataValues.phone,
        address: doctor?.dataValues.user?.dataValues.address,
        specialtyId: doctor?.dataValues.specialty?.dataValues.id,
        specialtyName: doctor?.dataValues.specialty?.dataValues.name,
        degree: doctor?.dataValues.degree,
        description: doctor?.dataValues.description,
        img: doctor?.dataValues.user?.dataValues.img
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async updateDoctorbyAdmin(id: string, body: EditDoctorType) {
    try {
      const doctor = await Doctor.findOne({
        where: { userId: id }
      })

      if (!doctor) throw new Error('Bác sĩ không tồn tại')

      let specialty = null
      if (body.specialtyId != null) {
        specialty = await Specialty.findByPk(body.specialtyId)
        if (!specialty) throw new Error('Chuyên khoa không tồn tại')
      }
      if (doctor) {
        await doctor.update({
          degree: body.degree,
          description: body.description,
          specialtyId: body.specialtyId
        })
      }
      return {
        message: 'Cập nhật thành công',
        doctor: {
          degree: doctor?.dataValues.degree,
          description: doctor?.dataValues.description,
          specialtyId: body.specialtyId,
          specialtyName: specialty?.dataValues.name,
        }
      }
    } catch (error : any) {
      throw new Error(error.message)
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

    if (doctor) {
      await doctor.destroy() // Xóa bản ghi bác sĩ trước
    }
    await user.destroy()
  }
}
