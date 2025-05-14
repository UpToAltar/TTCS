import { Op } from 'sequelize'
import { CreateInvoiceType, UpdateInvoiceType } from '~/type/invoice.type'
import { MedicalAppointment } from '~/models/MedicalAppointment'
import { Booking } from '~/models/Booking'
import { Service } from '~/models/Service'
import { MedicalRecord } from '~/models/MedicalRecord'
import { Invoice } from '~/models/Invoice'

import moment from 'moment'
import { User } from '~/models/User'
import { TimeSlot } from '~/models/TimeSlot'
import { Doctor } from '~/models/Doctor'
import { Notification } from '~/models/Notification'

export class InvoiceService {
  static async addInvoice(body: CreateInvoiceType) {
    try {
      const findAppointment = await MedicalAppointment.findOne({
        where: { id: body.appointmentId },
        include: [
          {
            model: Booking,
            as: 'booking',
            include: [
              {
                model: Service,
                as: 'service'
              },
              {
                model: User,
                as: 'patient'
              },
              {
                model: TimeSlot,
                as: 'timeSlot'
              }
            ]
          },
          {
            model: MedicalRecord,
            as: 'medicalRecord'
          }
        ]
      })
      if (!findAppointment) {
        throw new Error('Lịch hẹn không tồn tại')
      }

      if (body.total == null || typeof body.total !== 'number') {
        body.total = findAppointment?.dataValues.booking?.dataValues.service?.dataValues.price
      }


      if (findAppointment?.dataValues.booking?.dataValues.status == 'Đã hủy') {
        throw new Error('Lịch hẹn đã bị hủy')
      }

      const invoice = await Invoice.create({
        appointmentId: body.appointmentId,
        total: body.total,
        status: body.status,
        note: body.note
      })
      // Cập nhật trạng thái của lịch hẹn
      await findAppointment.update({
        status: 'Đã xuất hóa đơn'
      })

      const doctor = await Doctor.findOne({
        where: { id: findAppointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.doctorId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['userName', 'email', 'phone', 'address', 'id']
          }
        ]
      })

      // Tạo thông báo cho bác sĩ
      const notification = {
        title: 'Hóa đơn xuất thành công',
        content: `Hóa đơn đã được xuất vào ngày ${moment(findAppointment?.dataValues.date).format('DD/MM/YYYY')} cuộc hẹn với bệnh nhân ${findAppointment?.dataValues.booking?.dataValues.patient?.dataValues.userName}`,
        userId: doctor?.dataValues.user?.dataValues.id
      }
      await Notification.create({
        title: notification.title,
        content: notification.content,
        userId: notification.userId
      })
      return {
        id: findAppointment?.dataValues.booking?.dataValues.id || null,
        appointmentId: findAppointment?.dataValues.id || null,
        total: body.total || null,
        status: body.status || null,
        note: body.note || null,
        createdAt: moment(invoice?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(invoice?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
        appointment: {
          id: findAppointment?.dataValues.id || null,
          date: moment(findAppointment?.dataValues.date).format('DD/MM/YYYY') || null,
          status: findAppointment?.dataValues.status || null
        },
        service: {
          id: findAppointment?.dataValues.booking?.dataValues.service?.dataValues.id || null,
          name: findAppointment?.dataValues.booking?.dataValues.service?.dataValues.name || null,
          price: findAppointment?.dataValues.booking?.dataValues.service?.dataValues.price || null
        },
        medicalRecord: {
          id: findAppointment?.dataValues.medicalRecord?.dataValues.id || null,
          diagnosis: findAppointment?.dataValues.medicalRecord?.dataValues.diagnosis || null,
          prescription: findAppointment?.dataValues.medicalRecord?.dataValues.prescription || null,
          notes: findAppointment?.dataValues.medicalRecord?.dataValues.notes || null
        },
        patient: {
          id: findAppointment?.dataValues.booking?.dataValues.patient?.dataValues.id || null,
          userName: findAppointment?.dataValues.booking?.dataValues.patient?.dataValues.userName || null,
          email: findAppointment?.dataValues.booking?.dataValues.patient?.dataValues.email || null,
          phone: findAppointment?.dataValues.booking?.dataValues.patient?.dataValues.phone || null
        },
        timeSlot: {
          id: findAppointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.id || null,
          startDate:
            moment(findAppointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.startDate).format(
              'DD/MM/YYYY HH:mm:ss'
            ) || null,
          endDate:
            moment(findAppointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.endDate).format(
              'DD/MM/YYYY HH:mm:ss'
            ) || null,
          status: findAppointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.status || null
        },
        doctor: {
          id: doctor?.dataValues.id || null,
          userName: doctor?.dataValues.user?.dataValues.userName || null,
          email: doctor?.dataValues.user?.dataValues.email || null,
          phone: doctor?.dataValues.user?.dataValues.phone || null,
          address: doctor?.dataValues.user?.dataValues.address || null
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getAllInvoices(page: number, limit: number, search: string, sort: string, order: string) {
    try {
      const offset = (page - 1) * limit
      const whereCondition = search ? { name: { [Op.like]: `%${search}%` } } : {}

      const { rows, count } = await Invoice.findAndCountAll({
        where: whereCondition,
        order: [[sort, order]],
        limit,
        offset,
        include: [
          {
            model: MedicalAppointment,
            as: 'appointment',
            include: [
              {
                model: Booking,
                as: 'booking',
                include: [
                  {
                    model: Service,
                    as: 'service'
                  },
                  {
                    model: User,
                    as: 'patient'
                  },
                  {
                    model: TimeSlot,
                    as: 'timeSlot',
                    include: [
                      {
                        model: Doctor,
                        as: 'doctor'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })

      return {
        total: count,
        invoices: await Promise.all(
          rows.map(async (invoice) => {
            const doctor = await Doctor.findOne({
              where: {
                id: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.doctorId
              },
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['userName', 'email', 'phone', 'address', 'id']
                }
              ]
            })
            return {
              id: invoice?.dataValues.id || null,
              appointmentId: invoice?.dataValues.appointmentId || null,
              total: invoice?.dataValues.total || null,
              status: invoice?.dataValues.status || null,
              note: invoice?.dataValues.note || null,
              createdAt: moment(invoice?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss') || null,
              updatedAt: moment(invoice?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss') || null,
              appointment: {
                id: invoice?.dataValues.appointment?.dataValues.id || null,
                date: moment(invoice?.dataValues.appointment?.dataValues.date).format('DD/MM/YYYY') || null,
                status: invoice?.dataValues.appointment?.dataValues.status || null,
                code: invoice?.dataValues.appointment?.dataValues.code || null
              },
              service: {
                id: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.service?.dataValues.id || null,
                name: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.service?.dataValues.name || null,
                price: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.service?.dataValues.price || null
              },
              patient: {
                id: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.patient?.dataValues.id || null,
                userName:
                  invoice?.dataValues.appointment?.dataValues.booking?.dataValues.patient?.dataValues.userName || null,
                email:
                  invoice?.dataValues.appointment?.dataValues.booking?.dataValues.patient?.dataValues.email || null,
                phone: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.patient?.dataValues.phone || null
              },
              timeSlot: {
                id: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.id || null,
                startDate:
                  moment(
                    invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.startDate
                  ).format('DD/MM/YYYY HH:mm:ss') || null,
                endDate:
                  moment(
                    invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.endDate
                  ).format('DD/MM/YYYY HH:mm:ss') || null,
                status:
                  invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.status || null
              },
              doctor: {
                id: doctor?.dataValues.id || null,
                userId: doctor?.dataValues.user?.dataValues.id || null,
                userName: doctor?.dataValues.user?.dataValues.userName || null,
                email: doctor?.dataValues.user?.dataValues.email || null,
                phone: doctor?.dataValues.user?.dataValues.phone || null,
                address: doctor?.dataValues.user?.dataValues.address || null
              }
            }
          })
        )
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async getInvoiceById(id: string) {
    try {
      const invoice = await Invoice.findOne({
        where: { id },
        include: [
          {
            model: MedicalAppointment,
            as: 'appointment',
            include: [
              {
                model: Booking,
                as: 'booking',
                include: [
                  {
                    model: Service,
                    as: 'service'
                  },
                  {
                    model: User,
                    as: 'patient'
                  },
                  {
                    model: TimeSlot,
                    as: 'timeSlot'
                  }
                ]
              },
              {
                model: MedicalRecord,
                as: 'medicalRecord'
              }
            ]
          }
        ]
      })
      if (!invoice) return null

      const doctor = await Doctor.findOne({
        where: {
          id: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.doctorId
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['userName', 'email', 'phone', 'address', 'id']
          }
        ]
      })

      return {
        id: invoice?.dataValues.id || null,
        appointmentId: invoice?.dataValues.appointmentId || null,
        total: invoice?.dataValues.total || null,
        status: invoice?.dataValues.status || null,
        note: invoice?.dataValues.note || null,
        createdAt: moment(invoice?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss') || null,
        updatedAt: moment(invoice?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss') || null,
        appointment: {
          id: invoice?.dataValues.appointment?.dataValues.id || null,
          date: moment(invoice?.dataValues.appointment?.dataValues.date).format('DD/MM/YYYY') || null,
          status: invoice?.dataValues.appointment?.dataValues.status || null,
          code: invoice?.dataValues.appointment?.dataValues.code || null
        },
        service: {
          id: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.service?.dataValues.id || null,
          name: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.service?.dataValues.name || null,
          price: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.service?.dataValues.price || null
        },
        patient: {
          id: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.patient?.dataValues.id || null,
          userName:
            invoice?.dataValues.appointment?.dataValues.booking?.dataValues.patient?.dataValues.userName || null,
          email: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.patient?.dataValues.email || null,
          phone: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.patient?.dataValues.phone || null
        },
        timeSlot: {
          id: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.id || null,
          startDate:
            moment(
              invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.startDate
            ).format('DD/MM/YYYY HH:mm:ss') || null,
          endDate:
            moment(invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.endDate).format(
              'DD/MM/YYYY HH:mm:ss'
            ) || null,
          status: invoice?.dataValues.appointment?.dataValues.booking?.dataValues.timeSlot?.dataValues.status || null
        },
        doctor: {
          id: doctor?.dataValues.id || null,
          userName: doctor?.dataValues.user?.dataValues.userName || null,
          email: doctor?.dataValues.user?.dataValues.email || null,
          phone: doctor?.dataValues.user?.dataValues.phone || null,
          address: doctor?.dataValues.user?.dataValues.address || null
        },
        medicalRecord: {
          id: invoice?.dataValues.appointment?.dataValues.medicalRecord?.dataValues.id || null,
          diagnosis: invoice?.dataValues.appointment?.dataValues.medicalRecord?.dataValues.diagnosis || null,
          prescription: invoice?.dataValues.appointment?.dataValues.medicalRecord?.dataValues.prescription || null,
          notes: invoice?.dataValues.appointment?.dataValues.medicalRecord?.dataValues.notes || null
        }
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async updateInvoice(id: string, body: UpdateInvoiceType) {
    try {
      const invoice = await Invoice.findByPk(id)
      if (!invoice) throw new Error('Hóa đơn không tồn tại')

      await invoice.update({
        total: body.total,
        status: body.status,
        note: body.note
      })

      return {
        id: invoice?.dataValues.id,
        appointmentId: invoice?.dataValues.appointmentId,
        total: body.total,
        status: body.status,
        note: body.note,
        createdAt: moment(invoice?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(invoice?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static async deleteInvoice(id: string) {
    try {
      const invoice = await Invoice.findByPk(id)
      if (!invoice) throw new Error('Hóa đơn không tồn tại')
      await invoice.destroy()
      return {
        message: 'Xóa hóa đơn thành công'
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
