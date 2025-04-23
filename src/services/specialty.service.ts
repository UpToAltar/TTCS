import cloudinary from '~/config/cloudinary'
import { Specialty } from '../models/Specialty'
import uploadToCloudinary from '~/utils/upload'
import { Op } from 'sequelize'
import { Doctor } from '~/models/Doctor'
import { User } from '~/models/User'
import { UpdatedAt } from 'sequelize-typescript'
import moment from 'moment'

export class SpecialtyService {
  static async createSpecialty(name: string, file: Express.Multer.File) {
    const existingSpecialty = await Specialty.findOne({ where: { name } })
    if (existingSpecialty) throw new Error('Chuyên khoa đã tồn tại')
    // Upload ảnh lên Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer)
    const specialty = await Specialty.create({
      name,
      url: uploadResult?.secure_url
    })

    return specialty
      ? { id: specialty?.dataValues.id, name: specialty?.dataValues.name, url: specialty?.dataValues.url }
      : null
  }

  static async getAllSpecialties(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit
      const whereCondition = search ? { name: { [Op.like]: `%${search}%` } } : {}

      const { rows, count } = await Specialty.findAndCountAll({
        where: whereCondition,
        order: [[sort, order]],
        limit,
        offset
      })

      return {
        total: count,
        specialty: rows.map((specialty) => {
          return {
            id: specialty?.dataValues.id,
            name: specialty?.dataValues.name,
            url: specialty?.dataValues.url,
            createdAt: moment(specialty?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(specialty?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
          }
        })
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getSpecialtyById(id: string) {
    const specialty = await Specialty.findByPk(id)
    if (!specialty) throw new Error('Chuyên khoa không tồn tại')

    return specialty
      ? {
        id: specialty?.dataValues.id,
        name: specialty?.dataValues.name,
        url: specialty?.dataValues.url,
        createdAt: moment(specialty?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(specialty?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
      : null
  }

  static async updateSpecialty(id: string, name: string, file?: Express.Multer.File) {
    const specialty = await Specialty.findByPk(id)
    if (!specialty) throw new Error('Chuyên khoa không tồn tại')

    //  Kiểm tra tên đã tồn tại (trừ chính nó)
    const existingSpecialty = await Specialty.findOne({
      where: {
        name,
        id: { [Op.ne]: id } // Dùng Op.ne để kiểm tra khác ID hiện tại
      }
    })

    if (existingSpecialty) {
      throw new Error('Tên chuyên khoa đã tồn tại, vui lòng chọn tên khác')
    }

    let imageUrl = specialty?.dataValues.url

    if (file) {
      // **Lấy public_id từ URL ảnh cũ**
      const oldImagePublicId = imageUrl.split('/').pop()?.split('.')[0]

      // **Xóa ảnh cũ trên Cloudinary**
      if (oldImagePublicId) {
        await cloudinary.uploader.destroy(`TTCS/${oldImagePublicId}`)
      }

      // **Tải ảnh mới lên Cloudinary**
      const uploadResult = await uploadToCloudinary(file.buffer)
      imageUrl = uploadResult.secure_url
    }

    await Specialty.update({ name, url: imageUrl }, { where: { id } })

    return specialty ? { id: id, name: name, url: imageUrl } : null
  }

  static async deleteSpecialty(id: string) {
    const specialty = await Specialty.findByPk(id)
    if (!specialty) throw new Error('Chuyên khoa không tồn tại')

    // **Lấy public_id từ URL ảnh**
    const imagePublicId = specialty?.dataValues.url.split('/').pop()?.split('.')[0]

    // **Xóa ảnh trên Cloudinary**
    if (imagePublicId) {
      await cloudinary.uploader.destroy(`TTCS/${imagePublicId}`)
    }

    await specialty.destroy()
    return { message: 'Xóa chuyên khoa thành công' }
  }

  static async getAllDoctorBySpecialty(id: string) {
    const specialty = await Specialty.findByPk(id)
    if (!specialty) throw new Error('Chuyên khoa không tồn tại')

    const doctors = await Doctor.findAll({
      where: { specialtyId: id },
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name', 'url']
        },
        {
          model: User,
          attributes: ['id', 'userName', 'email', 'phone', 'address', 'img'],
        }
      ]
    })

    return {
      specialty: {
        id: specialty?.dataValues.id,
        name: specialty?.dataValues.name,
        url: specialty?.dataValues.url
      },
      doctors: doctors.map((doctor) => {
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
          img: doctor?.dataValues.user?.dataValues.img,
          createdAt: moment(doctor?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(doctor?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        }
      })
    }
  }
}
