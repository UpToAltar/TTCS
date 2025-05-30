import { Notification } from '~/models/Notification'
import { User } from '~/models/User'
import { Role } from '~/models/Role'
import moment from 'moment'
import { AddNotificationType, ContactUsNotificationType } from '~/type/notification.type'
import { where } from 'sequelize'
export class NotificationService {
  static async addNotification(body: AddNotificationType) {
    try {
      const user = await User.findByPk(body.userId)

      if (!user) throw new Error('Người dùng không tồn tại')

      const noti = await Notification.create({
        title: body.title,
        content: body.content,
        userId: body.userId
      })
      return {
        id: noti?.dataValues.id,
        title: noti?.dataValues.title,
        content: noti?.dataValues.content,
        userId: noti?.dataValues.userId,
        createdAt: noti?.dataValues.createdAt ? moment(noti?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss') : null,
        updatedAt: noti?.dataValues.updatedAt ? moment(noti?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss') : null
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async getAllNotifications(page: number, limit: number, sort: string, order: string, user: any) {
    try {
      let findUser = null
      if (user.role == 'Doctor' || user.role == 'User') {
        findUser = await User.findOne({ where: { id: user.id } })
        if (!findUser) throw new Error('Người dùng không tồn tại')
      }

      const whereCondition = findUser ? { userId: findUser?.dataValues.id } : {}

      const offset = (page - 1) * limit

      const { rows, count } = await Notification.findAndCountAll({
        where: whereCondition,
        order: [[sort, order]],
        limit,
        offset,
        include: [
          {
            model: User,
            attributes: ['userName']
          }
        ]
      })

      return {
        total: count,
        notifications: rows.map((notification) => ({
          id: notification?.dataValues.id,
          title: notification?.dataValues.title,
          content: notification?.dataValues.content,
          userId: notification?.dataValues.userId,
          userName: notification?.dataValues.user?.dataValues.userName || null,
          createdAt: moment(notification?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(notification?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        }))
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getNotificationById(id: string) {
    try {
      const notification = await Notification.findByPk(id, {
        include: [
          {
            model: User,
          }
        ]
      })
      return notification
        ? {
          id: notification?.dataValues.id,
          title: notification?.dataValues.title,
          content: notification?.dataValues.content,
          userId: notification?.dataValues.userId,
          userName: notification?.dataValues.user?.dataValues.userName || null,
          createdAt: moment(notification?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
          updatedAt: moment(notification?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        }
        : null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async deleteNotification(id: string) {
    try {
      const notification = await Notification.findByPk(id)
      if (!notification) {
        throw new Error('Thông báo không tồn tại')
      }
      await notification.destroy()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async contactUsNotification(body: ContactUsNotificationType) {
    try {
      const allAdmins = await User.findAll({
        include: [
          {
            model: Role,
            as: 'role',
            where: { name: 'Admin' }
          }
        ],
      })
      if (allAdmins.length == 0)
        throw new Error('Không có Admin nào')
      const title = `Liên hệ từ: ${body.name} - ${body.topic}`;
      const content = `Họ và tên: ${body.name}
        Email: ${body.email}
        SĐT: ${body.phone}
        Nội dung: ${body.content}
      `.trim();
      const notifications = allAdmins.map(admin => ({
        title,
        content,
        userId: admin?.dataValues.id
      }))
      await Notification.bulkCreate(notifications)
      return {
        message: 'Gửi liên hệ thành công',
        data: notifications.map((notification) => ({
          title: notification.title,
          content: notification.content,
          userId: notification.userId,
        }))
      }
    }
    catch (error: any) {
      throw new Error(error.message)
    }
  }
}
