import { EditDoctorType } from '~/type/doctor.type'
import { Op } from 'sequelize'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { Doctor } from '~/models/Doctor'
import { Specialty } from '~/models/Specialty'
import moment from 'moment'
import e from 'express'

export class DoctorService {
  static async getAllDoctor(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit

      // Điều kiện tìm kiếm theo userName, email, phone
      const userWhereCondition: any = {
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
              id: doctor?.dataValues.id || null,
              userId: user?.dataValues.id || null,
              userName: user?.dataValues.userName || null,
              email: user?.dataValues.email || null,
              phone: user?.dataValues.phone || null,
              gender: user?.dataValues.gender || null,
              address: user?.dataValues.address || null,
              roleName: user?.role?.dataValues.name || null,
              img: user?.dataValues.img || null,
              degree: doctor?.dataValues.degree || null,
              description: doctor?.dataValues.description || null,
              specialtyId: doctor?.dataValues.specialty?.dataValues.id || null,
              specialtyName: doctor?.dataValues.specialty?.dataValues.name || null,
              status: user?.dataValues.status || null,
              createdAt: moment(doctor?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
              updatedAt: moment(doctor?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
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
        id: doctor?.dataValues.id || null,
        userId: doctor?.dataValues.user?.dataValues.id || null,
        userName: doctor?.dataValues.user?.dataValues.userName || null,
        email: doctor?.dataValues.user?.dataValues.email || null,
        phone: doctor?.dataValues.user?.dataValues.phone || null,
        address: doctor?.dataValues.user?.dataValues.address || null,
        specialtyId: doctor?.dataValues.specialty?.dataValues.id || null,
        specialtyName: doctor?.dataValues.specialty?.dataValues.name || null,
        degree: doctor?.dataValues.degree || null,
        description: doctor?.dataValues.description || null,
        img: doctor?.dataValues.user?.dataValues.img || null,
        status: doctor?.dataValues.user?.dataValues.status || null,
        createdAt: moment(doctor?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(doctor?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async updateDoctorbyAdmin(id: string, body: EditDoctorType) {
    try {
      const doctor = await Doctor.findOne({
        where: { id: id }
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
          createdAt: moment(doctor?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(doctor?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Xóa bác sĩ
  static async deleteDoctor(id: string) {
    const doctor = await Doctor.findByPk(id)
    if (!doctor) throw new Error('Bác sĩ không tồn tại')
    const user = await User.findByPk(doctor?.dataValues.userId)
    if (!user) throw new Error('Người dùng không tồn tại')
    await doctor.destroy()
    await user.destroy()
    return {
      message: 'Xóa bác sĩ thành công'
    }
  }
}
