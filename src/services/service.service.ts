import { AddServiceType } from '~/type/service.type'
import { Service } from '~/models/Service'
import { Op } from 'sequelize'

export class ServiceService {
  static async addService(body: AddServiceType) {
    try {
      const find = await Service.findOne({ where: { name: body.name } })
      if (find) {
        throw new Error('Dịch vụ đã tồn tại')
      }
      const service = await Service.create({
        name: body.name,
        price: body.price,
        description: body.description
      })
      return {
        id: service?.dataValues.id,
        name: service?.dataValues.name,
        price: service?.dataValues.price,
        description: service?.dataValues.description
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getAllServices(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit
      const whereCondition = search ? { name: { [Op.like]: `%${search}%` } } : {}

      const { rows, count } = await Service.findAndCountAll({
        where: whereCondition,
        order: [[sort, order]],
        limit,
        offset
      })

      return {
        total: count,
        services: rows.map((service) => {
          return {
            id: service?.dataValues.id,
            name: service?.dataValues.name,
            price: service?.dataValues.price,
            description: service?.dataValues.description
          }
        })
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getServiceById(id: string) {
    try {
      const service = await Service.findByPk(id)
      return service
        ? {
            id: service?.dataValues.id,
            name: service?.dataValues.name,
            price: service?.dataValues.price,
            description: service?.dataValues.description
          }
        : null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async updateService(id: string, body: AddServiceType) {
    try {
      const service = await Service.findByPk(id)
      if (!service) {
        throw new Error('Dịch vụ không tồn tại')
      }

      const existingService = await Service.findOne({ where: { name: body.name, id: { [Op.ne]: id } } })
      if (existingService) {
        throw new Error('Tên dịch vụ đã tồn tại')
      }

      await service.update({
        name: body.name,
        price: body.price,
        description: body.description
      })
      return service
        ? {
            id: service?.dataValues.id,
            name: service?.dataValues.name,
            price: service?.dataValues.price,
            description: service?.dataValues.description
          }
        : null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async deleteService(id: string) {
    try {
      const service = await Service.findByPk(id)
      if (!service) {
        throw new Error('Dịch vụ không tồn tại')
      }
      await service.destroy()
      return { message: 'Dịch vụ đã được xóa' }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
