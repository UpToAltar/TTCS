import cloudinary from '~/config/cloudinary'
import { Specialty } from '../models/Specialty'
import uploadToCloudinary from '~/utils/upload'
import { Op } from 'sequelize'
import { AddNewsType } from '~/type/news.type'
import { News } from '~/models/News'
import moment from 'moment'
import { User } from '~/models/User'

export class NewsService {
  static async createNews(body: AddNewsType, file: Express.Multer.File) {
    // Upload ảnh lên Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer)
    const news = await News.create({ ...body, img: uploadResult.secure_url })
    const user = await User.findByPk(body.userId)
    return news
      ? {
          id: news?.dataValues.id,
          name: news?.dataValues.name,
          description: news?.dataValues.description,
          type: news?.dataValues.type,
          img: news?.dataValues.img,
          user: {
            id: user?.dataValues.id,
            userName: user?.dataValues.userName,
            email: user?.dataValues.email
          },
          createdAt: news?.dataValues.createdAt
            ? moment(news?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
            : null,
          updatedAt: news?.dataValues.updatedAt
            ? moment(news?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
            : null
        }
      : null
  }

  static async getAllNews(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit
      const whereCondition = search ? { name: { [Op.like]: `%${search}%` } } : {}

      const { rows, count } = await News.findAndCountAll({
        where: whereCondition,
        order: [[sort, order]],
        limit,
        offset,
        include: [
          {
            model: User,
            as: 'user',
            required: true
          }
        ]
      })
      return {
        total: count,
        news: rows.map((news) => {
          return {
            id: news?.dataValues.id,
            name: news?.dataValues.name,
            description: news?.dataValues.description,
            type: news?.dataValues.type,
            img: news?.dataValues.img,
            user: {
              id: news?.dataValues.user?.dataValues.id,
              userName: news?.dataValues.user?.dataValues.userName,
              email: news?.dataValues.user?.dataValues.email
            },
            createdAt: news?.dataValues.createdAt
              ? moment(news?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
              : null,
            updatedAt: news?.dataValues.updatedAt
              ? moment(news?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
              : null
          }
        })
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getNewsById(id: string) {
    const news = await News.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    })
    if (!news) throw new Error('Tin tức không tồn tại')

    return news
      ? {
          id: news?.dataValues.id,
          name: news?.dataValues.name,
          description: news?.dataValues.description,
          type: news?.dataValues.type,
          img: news?.dataValues.img,
          user: {
            id: news?.dataValues.user?.dataValues.id,
            userName: news?.dataValues.user?.dataValues.userName,
            email: news?.dataValues.user?.dataValues.email
          },
          createdAt: news?.dataValues.createdAt
            ? moment(news?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
            : null,
          updatedAt: news?.dataValues.updatedAt
            ? moment(news?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
            : null
        }
      : null
  }

  static async updateNews(id: string, body : AddNewsType, file?: Express.Multer.File) {
    const news = await News.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    })
    if (!news) throw new Error('Bài viết không tồn tại')

    let imageUrl = news?.dataValues.img

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

    await News.update({ ...body, img: imageUrl }, { where: { id } })

    return news
      ? {
          id: news?.dataValues.id,
          name: body.name,
          description: body.description,
          type: body.type,
          img: imageUrl,
          user: {
            id: news?.dataValues.user?.dataValues.id,
            userName: news?.dataValues.user?.dataValues.userName,
            email: news?.dataValues.user?.dataValues.email
          },
          createdAt: news?.dataValues.createdAt
            ? moment(news?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
            : null,
          updatedAt: moment().format('DD/MM/YYYY HH:mm:ss')
        }
      : null
  }

  static async deleteNews(id: string) {
    const news = await News.findByPk(id)
    if (!news) throw new Error('Bài viết không tồn tại')

    // **Lấy public_id từ URL ảnh**
    const imagePublicId = news?.dataValues.img.split('/').pop()?.split('.')[0]

    // **Xóa ảnh trên Cloudinary**
    if (imagePublicId) {
      await cloudinary.uploader.destroy(`TTCS/${imagePublicId}`)
    }

    await news.destroy()
    return { message: 'Xóa bài viết thành công' }
  }
}
