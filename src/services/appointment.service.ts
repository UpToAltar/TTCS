import { Op } from 'sequelize'
import { Booking } from '~/models/Booking'
import { User } from '~/models/User'
import { TimeSlot } from '~/models/TimeSlot'
import { Doctor } from '~/models/Doctor'
import { v4 as uuidv4 } from 'uuid'
import { validateAuthorization } from '~/utils/validateAuthorization'
import moment from 'moment'
import { MedicalAppointment } from '~/models/MedicalAppointment'
import { createAppointmentType, UpdateAppointmentType } from '~/type/appointment.type'
import { Invoice } from '~/models/Invoice'
import { BookingService } from './booking.service'
import { generateToken } from '~/utils/token'

export class AppointmentService {
  public static async generateAppointmentCode(): Promise<string> {
    // Find the latest appointment code
    const latestAppointment = await MedicalAppointment.findOne({
      where: {
        code: {
          [Op.like]: 'AP%'
        }
      },
      order: [['code', 'DESC']]
    })

    let nextNumber = 1
    if (latestAppointment?.dataValues.code) {
      // Extract the number part and increment
      const currentNumber = parseInt(latestAppointment.dataValues.code.substring(2))
      nextNumber = currentNumber + 1
    }

    // Format the new code with leading zeros
    return `AP${String(nextNumber).padStart(5, '0')}`
  }

  static async addAppointment(body: createAppointmentType, user: any) {
    const findBooking = await Booking.findOne({
      where: {
        id: body.bookingId,
        status: true
      }
    })
    if (!findBooking)
      throw new Error('Lịch hẹn không tồn tại hoặc chưa được xác nhận')
    const timeSlot = await TimeSlot.findOne({
      where: { id: findBooking?.dataValues.timeSlotId }
    })
    if (!timeSlot) throw new Error('Không tìm thấy giờ hẹn');
    const findDoctor = await Doctor.findOne({
      where: { id: timeSlot?.dataValues.doctorId }
    })

    if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
    //Check quyền
    if (!validateAuthorization(user, findDoctor?.dataValues.userId)) {
      throw new Error('Bạn không có quyền')
    }
    //Check có lịch hẹn
    const findAppointment = await MedicalAppointment.findOne({
      where: {
        bookingId: body.bookingId,
      }
    })
    if (findAppointment) throw new Error('Lịch hẹn đã tồn tại')

    // Generate new appointment code
    const appointmentCode = await AppointmentService.generateAppointmentCode()

    const appointment = await MedicalAppointment.create({
      id: uuidv4(),
      code: appointmentCode,
      bookingId: body.bookingId,
      medicalRecordId: null,
      date: new Date,
      status: 'Chờ khám'
    })
    return appointment
      ? {
        id: appointment?.dataValues.id,
        code: appointment?.dataValues.code,
        bookingId: appointment?.dataValues.bookingId,
        status: appointment?.dataValues.status,
        date: moment(appointment?.dataValues.date).format('DD/MM/YYYY'),
        createdAt: moment(appointment?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(appointment?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
      : null
  }
  static async getAllAppointments(page: number, limit: number, sort: string, order: string, user: any) {
    try {
      //Check quyền
      let findDoctor = null
      if (user.role == 'Doctor') {
        findDoctor = await Doctor.findOne({ where: { userId: user.id } })
        if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
      }

      const offset = (page - 1) * limit
      const whereCondition = findDoctor ? { doctorId: findDoctor?.dataValues.id } : {}

      const { rows, count } = await MedicalAppointment.findAndCountAll({
        where: {},
        include: [
          {
            model: Booking,
            required: true,
            include: [
              {
                model: TimeSlot,
                required: true,
                where: whereCondition
              }
            ]
          }
        ],
        order: [[sort, order]],
        limit,
        offset
      })

      return {
        total: count,
        appointment: rows.map((appointment) => {
          return {
            id: appointment?.dataValues.id,
            code: appointment?.dataValues.code,
            bookingId: appointment?.dataValues.bookingId,
            status: appointment?.dataValues.status,
            bookingCode: appointment?.dataValues.booking?.dataValues.code || null,
            date: moment(appointment?.dataValues.date).format('DD/MM/YYYY'),
            recordId: appointment?.dataValues.medicalRecordId || null,
            createdAt: moment(appointment?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(appointment?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
          }
        })
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  static async getAppointmentById(id: string) {
    const appointment = await MedicalAppointment.findByPk(id)
    if (!appointment) throw new Error('Lịch hẹn không tồn tại')

    return appointment
      ? {
        id: appointment?.dataValues.id,
        code: appointment?.dataValues.code,
        bookingId: appointment?.dataValues.bookingId,
        status: appointment?.dataValues.status,
        date: moment(appointment?.dataValues.date).format('DD/MM/YYYY'),
        createdAt: moment(appointment?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(appointment?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
      : null
  }
  static async updateAppointment(id: string, body: UpdateAppointmentType, user: any) {
    const appointment = await MedicalAppointment.findByPk(id)
    if (!appointment) throw new Error('Lịch hẹn không tồn tại')

    const findBooking = await Booking.findOne({
      where: {
        id: appointment?.dataValues.bookingId,
        status: true
      }
    })
    if (!findBooking)
      throw new Error('Lịch hẹn không tồn tại hoặc chưa được xác nhận')
    const timeSlot = await TimeSlot.findOne({
      where: { id: findBooking?.dataValues.timeSlotId }
    })
    if (!timeSlot) throw new Error('Không tìm thấy giờ hẹn');
    const findDoctor = await Doctor.findOne({
      where: { id: timeSlot?.dataValues.doctorId }
    })

    if (!findDoctor) throw new Error('Bác sĩ không tồn tại')
    //Check quyền
    if (!validateAuthorization(user, findDoctor?.dataValues.userId)) {
      throw new Error('Bạn không có quyền')
    }

    if (body.status == 'Đã hủy') {
      const token = generateToken({ bookingId: findBooking?.dataValues.id })
      return await BookingService.verifyCancelBEmail(token)
    } else{
      await appointment.update({
        status: body.status,
      })
    }

    return appointment
      ? {
        id: appointment?.dataValues.id,
        bookingId: appointment?.dataValues.bookingId,
        status: appointment?.dataValues.status,
        date: moment(appointment?.dataValues.date).format('DD/MM/YYYY'),
        createdAt: moment(appointment?.dataValues.createdAt).format('DD/MM/YYYY HH:mm:ss'),
        updatedAt: moment(appointment?.dataValues.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }
      : null
  }

  static async deleteAppointment(id: string, user: any) {
    const appointment = await MedicalAppointment.findByPk(id)
    if (!appointment) throw new Error('Lịch hẹn không tồn tại')

    // Kiểm tra xem đã có hồ sơ khám chưa
    if (appointment?.dataValues.medicalRecordId != null) {
      throw new Error('Lịch hẹn đã có hồ sơ khám')
    }
    // Kiểm tra đã xuất hóa đơn chưa
    const findInvoice = await Invoice.findOne({
      where: {
        appointmentId: id
      }
    })
    if (findInvoice) throw new Error('Lịch hẹn đã xuất hóa đơn')

    //Kiểm tra lịch hẹn đã hủy mới được xóa
    if (appointment?.dataValues.status == 'Đã hủy') {
      await appointment.destroy()
      return true
    } else {
      throw new Error('Chỉ được xóa lịch hẹn đã hủy')
    }
  }
}