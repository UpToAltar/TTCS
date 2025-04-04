import { Notification } from '~/models/Notification'
import { Op } from 'sequelize'
import moment from 'moment'
import { AddNotificationType } from '~/type/notification.type'
export class NotificationService {
    static async addNotification(body: AddNotificationType) {
        try {
            const noti = await Notification.create({
                title: body.title,
                content: body.content,
                userId: body.userId
            })
            return {
                id: noti.dataValues.id,
                title: noti.dataValues.title,
                content: noti.dataValues.content,
                userId: noti.dataValues.userId,
                createdAt: noti?.dataValues.createdAt
                    ? moment(noti?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
                    : null,
            }
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
    static async getAllNotifications(page: number, limit: number, search: string, sort: string, order: string) {
        try {
            const offset = (page - 1) * limit
            const whereCondition = search ? { title: { [Op.like]: `%${search}%` } } : {}

            const { rows, count } = await Notification.findAndCountAll({
                where: whereCondition,
                order: [[sort, order]],
                limit,
                offset
            })

            return {
                total: count,
                notifications: rows.map((notification) => ({
                    id: notification.dataValues.id,
                    title: notification.dataValues.title,
                    content: notification.dataValues.content,
                    userId: notification.dataValues.userId,
                    createdAt: notification?.dataValues.createdAt
                        ? moment(notification?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
                        : null,
                }))
            }
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    static async getNotificationById(id: string) {
        try {
            const notification = await Notification.findByPk(id)
            return notification
                ? {
                    id: notification.dataValues.id,
                    title: notification.dataValues.title,
                    content: notification.dataValues.content,
                    userId: notification.dataValues.userId,
                    createdAt: notification?.dataValues.createdAt
                        ? moment(notification?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
                        : null,
                }
                : null
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    // static async updateNotification(id: string, content: string) {
    //     try {
    //         const notification = await Notification.findByPk(id)
    //         if (!notification) {
    //             throw new Error('Thông báo không tồn tại')
    //         }

    //         await notification.update({ content })
    //         return {
    //             id: notification.dataValues.id,
    //             title: notification.dataValues.title,
    //             content: notification.dataValues.content,
    //             userId: notification.dataValues.userId,
    //             createdAt: notification?.dataValues.createdAt
    //                 ? moment(notification?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss')
    //                 : null,
    //         }
    //     } catch (error: any) {
    //         throw new Error(error.message)
    //     }
    // }

    static async deleteNotification(id: string) {
        try {
            const notification = await Notification.findByPk(id)
            if (!notification) {
                throw new Error('Thông báo không tồn tại')
            }
            await notification.destroy()
            return { message: 'Thông báo đã được xóa' }
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
}
